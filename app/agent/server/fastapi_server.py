import asyncio
import json
import sys

from fastapi import FastAPI
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain_core.messages import ToolMessage, AIMessageChunk, AIMessage

from app.agent.tools.sandbox_tools_client import get_sandbox_tools
from app.bailian.common import llm

app = FastAPI()

WORKING_DIR = "/home/gem/workspace"

RECURSION_LIMIT = 100

@wrap_tool_call
async def handle_tool_errors(request, handler):
    """Handle tool execution errors with custom messages."""
    try:
        if 'sandbox_execute_bash' == request.tool_call['name']:
            args = request.tool_call['args']
            args['cwd'] = WORKING_DIR
            request.tool_call['args'] = args

        return await handler(request)
    except Exception as e:
        # Return a custom error message to the model
        return ToolMessage(
            content=f"Tool error: Please check your input and try again. ({str(e)})",
            tool_call_id=request.tool_call["id"]
        )



#sandbox_tools = asyncio.run(get_sandbox_tools())

web_system_prompt = f"""你是一个前端技术专家, 擅长使用各种前端技术完成用户的需求。\n 

"""

# system_prompt = f"你是一个资深的情报专家, 可以使用Chrome浏览器打开各类网站, 并从中获取有价值的信息, 帮助用户完成任务. \n打开浏览器软件方法: 使用 win+r命令, 然后输入浏览器软件名称, 按回车建打开浏览器软件.\n 工具操作的文件根目录是 {ROOT_DIR}, 不允许操作根目录之外的文件."

agent = create_agent(model=llm,
 #                    tools=sandbox_tools,
                     system_prompt=web_system_prompt,
                     middleware=[handle_tool_errors],
                     debug=False)


async def event_streaming(thread_id: str, user_input: str):
    async for chunk in agent.astream(input={
        "messages": [
            {"role": "user", "content": f"{user_input}"}
        ]
    }, stream_mode=["messages", "updates"], config={
        "configurable": {
            "thread_id": thread_id
        },
        "recursion_limit": RECURSION_LIMIT
    }):
        # 处理 messages 模式 - 逐token流式输出
        if isinstance(chunk, tuple) and len(chunk) == 2:
            stream_type, message_chunk = chunk
            if stream_type == "messages":
                if isinstance(message_chunk, tuple):
                    msg_chunk, metadata = message_chunk
                    if isinstance(msg_chunk, AIMessageChunk):
                        # 逐token输出AI内容
                        if hasattr(msg_chunk, 'content') and msg_chunk.content:
                            # 计算新增的内容
                            new_content = msg_chunk.content
                            print(new_content, end="", flush=True)
                            yield msg_chunk.content
            elif stream_type == "updates":
                items = message_chunk.items()
                for item in items:
                    if not isinstance(item, tuple) or len(item) != 2:
                        continue
                    node_name, node_output = item
                    if node_name == 'model':
                        model_msg = node_output
                        if "messages" not in model_msg:
                            continue
                        for msg in model_msg["messages"]:
                            if isinstance(msg, AIMessage):
                                if msg.content != "":
                                    continue
                                elif not msg.content and msg.tool_calls:
                                    # 工具调用
                                    tool_name = msg.tool_calls[-1]['name']
                                    yield f"调用工具： {tool_name}, 参数: {json.dumps(msg.tool_calls[-1]['args'], indent=2, ensure_ascii=False)}"
                            elif isinstance(msg, ToolMessage):
                                # 工具调用结果
                                yield f"工具 [{msg.name}] 执行完成, {msg.content}"
                    elif node_name == 'tools':
                        tool_msg = node_output
                        if "messages" not in tool_msg:
                            continue
                        for msg in tool_msg["messages"]:
                            if isinstance(msg, ToolMessage):
                                # 工具调用结果
                                yield f"工具 [{msg.name}] 执行完成, {msg.content}"
            continue  # 跳过后续处理，继续下一个chunk

@app.post(path="/chat/{session_id}")
async def chat(session_id: str, input: str):
    from starlette.responses import StreamingResponse
    return StreamingResponse(event_streaming(session_id, input), media_type="text/event-stream")