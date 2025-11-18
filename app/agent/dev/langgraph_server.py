import asyncio

from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call
from langchain_core.messages import ToolMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.tools.sandbox_tools_client import get_sandbox_tools
from app.bailian.common import llm

WORKING_DIR = "/home/gem/workspace"

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



sandbox_tools = asyncio.run(get_sandbox_tools())

web_system_prompt = f"""你是一个前端技术专家, 擅长使用各种前端技术完成用户的需求。\n 

"""

# system_prompt = f"你是一个资深的情报专家, 可以使用Chrome浏览器打开各类网站, 并从中获取有价值的信息, 帮助用户完成任务. \n打开浏览器软件方法: 使用 win+r命令, 然后输入浏览器软件名称, 按回车建打开浏览器软件.\n 工具操作的文件根目录是 {ROOT_DIR}, 不允许操作根目录之外的文件."

agent = create_agent(model=llm,
                     tools=sandbox_tools,
                     system_prompt=web_system_prompt,
                     middleware=[handle_tool_errors],
                     debug=False)
