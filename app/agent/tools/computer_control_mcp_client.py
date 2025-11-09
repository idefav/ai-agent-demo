import asyncio

from app.agent.utils.mcp_utils import create_stdio_mcp_client


async def get_computer_control_tools_client():
    params={
        "command": "C:\\Users\\idefav\\miniconda3\\envs\\3.14\\Scripts\\uv.exe",
        "args": [
            "computer-control-mcp@latest"
        ],
    }

    client, tools = await create_stdio_mcp_client(name="computer-control-mcp", params=params)
    return tools



