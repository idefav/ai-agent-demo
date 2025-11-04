import os

from langchain_mcp_adapters.client import MultiServerMCPClient


async def mcp_github_client():
    mcp_client = MultiServerMCPClient(
        {
            "github": {
                "command": "npx",
                "args": [
                    "-y",
                    "@modelcontextprotocol/server-github"
                ],
                "env": {
                    "GITHUB_PERSONAL_ACCESS_TOKEN": os.getenv("GITHUB_TOKEN")
                },
                "transport": "stdio",
            }
        })
    return mcp_client,await mcp_client.get_tools()