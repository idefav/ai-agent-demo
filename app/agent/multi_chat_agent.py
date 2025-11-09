from langchain.agents import create_agent
from langchain_core.messages import SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import MemorySaver

from app.bailian.common import llm
from app.bailian.tools.file_tools import getFileTools


def create_react_agent():
    file_tools = getFileTools("/Users/wuzishu/PycharmProjects/ai-agent-demo/tmp")
    agent = create_agent(
        model=llm,
        tools=file_tools,
        checkpointer=MemorySaver(),
        system_prompt="你是一个技术专家，擅长解决各种Web开发中的技术问题.",
        debug=True)

    return agent;


def run_agent():
    agent = create_react_agent()
    config = {"configurable": {"thread_id": "1"}}

    while True:
        user_input = input("U>")
        if user_input == "exit" or user_input == "quit":
            break

        resp = agent.stream(input={
            "messages": [
                {"role": "user", "content": f"{user_input}"}
            ]}, config=config)

        print("AI>")
        for chunk in resp:
            print(chunk, end="")


if __name__ == "__main__":
    run_agent()
