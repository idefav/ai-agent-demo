from langchain_mcp_adapters.client import MultiServerMCPClient


async def mcp_playwright_client():
    mcp_client = MultiServerMCPClient(
        {"playwright": {"command": "npx", "args": ["@playwright/mcp@latest"], "transport": "stdio", }})
    return mcp_client,await mcp_client.get_tools()
