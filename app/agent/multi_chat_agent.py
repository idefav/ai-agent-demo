import asyncio
import json
import time
import sys
from threading import Thread

from langchain.agents import create_agent
from langchain_community.agent_toolkits import FileManagementToolkit
from langchain_core.messages import AIMessage, ToolMessage, AIMessageChunk
from langgraph.checkpoint.memory import MemorySaver

from app.agent.tools.computer_control_mcp_client import get_computer_control_tools_client
from app.agent.tools.sandbox_tools_client import get_sandbox_tools
from app.agent.tools.shell_tools_client import get_stdio_shell_tools
from app.agent.tools.time_tools_client import get_stdio_current_time_tool
from app.agent.tools.windows_use_tools_client import get_windows_use_tools_client
from app.bailian.common import llm

ROOT_DIR = "C:\\Users\\idefav\\Documents\\src\\ai-agent-demo\\tmp"


class ThinkingAnimation:
    """思考动画类"""

    def __init__(self):
        self.is_thinking = False
        self.thread = None

    def _animate(self):
        """动画循环"""
        frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
        idx = 0
        while self.is_thinking:
            sys.stdout.write(f"\r🤔 AI 思考中 {frames[idx % len(frames)]} ")
            sys.stdout.flush()
            idx += 1
            time.sleep(0.1)

    def start(self):
        """开始动画"""
        if not self.is_thinking:
            self.is_thinking = True
            self.thread = Thread(target=self._animate, daemon=True)
            self.thread.start()

    def stop(self):
        """停止动画"""
        if self.is_thinking:
            self.is_thinking = False
            if self.thread:
                self.thread.join()
            sys.stdout.write("\r" + " " * 50 + "\r")  # 清除动画行
            sys.stdout.flush()


def print_with_time(title, content, elapsed_time, icon="📝"):
    """带耗时的打印函数"""
    print("\n" + icon + " " + "=" * 58)
    print(f"{title} (耗时: {elapsed_time:.2f}秒)")
    print("-" * 60)
    print(content)
    print("=" * 60)


async def create_multi_chat_agent():
    file_toolkit = FileManagementToolkit(root_dir=ROOT_DIR)
    # file_tools = file_toolkit.get_tools()

    # shell_tools = await get_stdio_shell_tools()

    # time_tools = await get_stdio_current_time_tool()

    # windows_use_tools = await get_windows_use_tools_client()

    # computer_control_tools =await  get_computer_control_tools_client()

    sandbox_tools = await get_sandbox_tools()

    memory_saver = MemorySaver()

    web_system_prompt = f"你是一个前端技术专家, 擅长使用各种前端技术完成用户的需求。\n 工具操作的文件根目录是 {ROOT_DIR}, 不允许操作根目录之外的文件."

    # system_prompt = f"你是一个资深的情报专家, 可以使用Chrome浏览器打开各类网站, 并从中获取有价值的信息, 帮助用户完成任务. \n打开浏览器软件方法: 使用 win+r命令, 然后输入浏览器软件名称, 按回车建打开浏览器软件.\n 工具操作的文件根目录是 {ROOT_DIR}, 不允许操作根目录之外的文件."

    agent = create_agent(model=llm,
                         tools=sandbox_tools,
                         checkpointer=memory_saver,
                         system_prompt=web_system_prompt,
                         debug=False)
    return agent


async def run():
    agent = await create_multi_chat_agent()
    thinking_animation = ThinkingAnimation()

    while True:
        user_input = input("\n💬 用户>> ")
        if user_input == "exit" or user_input == "quit":
            print("👋 退出对话。")
            break

        # 开始思考动画和计时
        thinking_animation.start()
        start_time = time.time()
        ai_start_time = None
        tool_start_times = {}
        current_ai_content = ""  # 用于累积AI回复内容
        is_streaming_ai = False  # 标记是否正在流式输出AI回复

        async for chunk in agent.astream(input={
            "messages": [
                {"role": "user", "content": f"{user_input}"}
            ]
        }, stream_mode=[ "updates"], config={
            "configurable": {
                "thread_id": "1"
            }
        }):
            # 处理 messages 模式 - 逐token流式输出
            if isinstance(chunk, tuple) and len(chunk) == 2:
                node_name, message = chunk

                for msg in message:
                    if isinstance(msg, AIMessageChunk):
                        # 停止思考动画(只在第一个token时)
                        if thinking_animation.is_thinking:
                            thinking_animation.stop()
                            if ai_start_time is None:
                                ai_start_time = start_time
                            print("\n" + "🤖 " + "=" * 58)
                            print("🤖 AI 回复 (实时流式):")
                            print("-" * 60)
                            is_streaming_ai = True

                        # 逐token输出AI内容
                        if hasattr(msg, 'content') and msg.content:
                            # 计算新增的内容
                            new_content = msg.content[len(current_ai_content):]
                            print(new_content, end="", flush=True)
                            current_ai_content = msg.content

                continue

            # 处理 updates 模式
            items = chunk.items()

            for node_name, node_output in items:
                if "messages" not in node_output:
                    continue
                for msg in node_output["messages"]:
                    if isinstance(msg, AIMessage):
                        # 如果之前在流式输出，显示结束标记
                        if is_streaming_ai and current_ai_content:
                            ai_elapsed = time.time() - ai_start_time
                            print()  # 换行
                            print("=" * 60)
                            print(f"⏱️  AI 回复耗时: {ai_elapsed:.2f}秒")
                            is_streaming_ai = False
                            current_ai_content = ""

                        if msg.content and not is_streaming_ai:
                            # 如果没有流式输出过，直接显示完整内容（备用方案）
                            thinking_animation.stop()
                            if ai_start_time is None:
                                ai_start_time = start_time

                            print("\n" + "🤖 " + "=" * 58)
                            print("🤖 AI 回复:")
                            print("-" * 60)
                            print(msg.content)

                            ai_elapsed = time.time() - ai_start_time
                            print("=" * 60)
                            print(f"⏱️  AI 回复耗时: {ai_elapsed:.2f}秒")

                        if not msg.content and msg.tool_calls:
                            # 工具调用
                            tool_name = msg.tool_calls[-1]['name']
                            tool_start_times[tool_name] = time.time()

                            print("\n" + "🔧 " + "=" * 58)
                            print(f"📞 准备调用工具: {tool_name}")
                            print("-" * 60)
                            print("📋 请求参数:")
                            print(json.dumps(msg.tool_calls[-1]['args'], indent=2, ensure_ascii=False))
                            print("=" * 60)

                            # 显示工具执行动画
                            print("⏳ 工具执行中...", end="", flush=True)

                    if isinstance(msg, ToolMessage):
                        # 清除工具执行提示
                        sys.stdout.write("\r" + " " * 50 + "\r")
                        sys.stdout.flush()

                        # 计算工具调用耗时
                        tool_elapsed = 0
                        if msg.name in tool_start_times:
                            tool_elapsed = time.time() - tool_start_times[msg.name]
                            del tool_start_times[msg.name]

                        print_with_time(
                            f"� 工具 [{msg.name}] 执行完成",
                            msg.content,
                            tool_elapsed,
                            "✅"
                        )

                        # 工具执行完后,重新开始思考动画
                        thinking_animation.start()
                        ai_start_time = time.time()

        # 确保动画停止
        thinking_animation.stop()

        # 显示总耗时
        total_elapsed = time.time() - start_time
        print(f"\n⏱️  总耗时: {total_elapsed:.2f}秒")

        # if "model" in chunk:
        #     print("AI>> ", end="", flush=True)
        #     model_response = chunk["model"]
        #     if model_response["messages"][-1].content:
        #         print(model_response["messages"][-1].content, end="", flush=True)
        #     else:
        #         print(
        #             f"工具调用 ({model_response["messages"][-1].tool_calls[-1]['name']}) 工具>> 请求:\n {model_response["messages"][-1].tool_calls[-1]['args']}",
        #             end="\n", flush=True)
        #
        # elif "tools" in chunk:
        #     print("工具调用结果>>", end="", flush=True)
        #     tool_responses = chunk["tools"]
        #     print(f"调用工具: {tool_responses['messages'][-1].content}", end="", flush=True)

        print()  # 换行


if __name__ == "__main__":
    asyncio.run(run())
