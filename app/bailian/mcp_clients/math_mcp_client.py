import asyncio

from langchain.agents import create_agent
from langchain_mcp_adapters.tools import load_mcp_tools
from mcp import StdioServerParameters, stdio_client, ClientSession

from app.bailian.common import llm

server_parameters = StdioServerParameters(command="python",
                                   args=["C:\\Users\\idefav\\Documents\\src\\ai-agent-demo\\app\\mcp\\math_mcp_server.py"])

async def main():
    async with stdio_client(server_parameters) as (reader, writer):
        async with ClientSession(reader, writer) as session:
            await session.initialize()
            tools = await load_mcp_tools(session)
            print(tools)
            agent =create_agent(model=llm, tools=tools, debug=True)
            response =await agent.ainvoke({
                "messages":[
                    {"role":"system","content":"你是一位数学专家，擅长回答数学领域的问题。"},
                    {"role":"user","content":"计算: 100+100"}
                ]
            })

            print(response)



asyncio.run(main())
