import asyncio

from langchain.agents import create_agent
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langchain_mcp_adapters.tools import load_mcp_tools
from mcp import StdioServerParameters, stdio_client, ClientSession

from app.bailian.common import llm
from app.bailian.mcp_clients.github_mcp_client import mcp_github_client
from app.bailian.mcp_clients.playwright_mcp_client import mcp_playwright_client
from app.common.init import initEnvironment

initEnvironment()

async def main():
    client, tools = await mcp_github_client()
    print(tools)
    agent = create_agent(model=llm, tools=tools, debug=False)
    resp = await agent.ainvoke({
        "messages": [
            {"role": "user", "content": "查询下idefav的所有公共仓库"}
        ]
    })

    messages = resp["messages"]
    for message in messages:
        if (isinstance(message, HumanMessage)):
            print(f"Human: {message.content}")
        elif (isinstance(message, AIMessage)):
            if message.content:
                print(f"AI: {message.content}")
            for tool_call in message.tool_calls:
                print(f"Tool Call: {tool_call["name"]} with input {tool_call["args"]}")

        elif (isinstance(message, ToolMessage)):
            print(f"Tool Response: {message.name}")





asyncio.run(main())