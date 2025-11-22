import asyncio

from langchain_mcp_adapters.client import MultiServerMCPClient


async def get_sandbox_tools():
    # Run blocking initialization in a separate thread
    mcp_client = await asyncio.to_thread(MultiServerMCPClient, 
        {"sandbox": {"transport": "streamable_http", "url": "http://localhost:48080/mcp"}})

    tools = await mcp_client.get_tools()
    return tools

