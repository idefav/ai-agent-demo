from app.agent.utils.mcp_utils import create_stdio_mcp_client


async def get_windows_use_tools_client():
    params={
        "command": "C:\\Users\\idefav\\miniconda3\\envs\\3.14\\Scripts\\uv.exe",
        "args": [
            "--directory",
            "C:\\Users\\idefav\\Documents\\src\\Windows-MCP",
            "run",
            "main.py"
        ],
    }

    client, tools = await create_stdio_mcp_client(name="windows-mcp", params=params)
    return tools
