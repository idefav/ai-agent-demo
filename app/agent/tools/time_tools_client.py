import asyncio

from app.agent.utils.mcp_utils import create_stdio_mcp_client


async def get_stdio_current_time_tool():
    params = {
        "command": "C:\\Users\\idefav\\Documents\\src\\ai-agent-demo\\.venv\\Scripts\\python.exe",
        "args": ["C:\\Users\\idefav\\Documents\\src\\ai-agent-demo\\app\\agent\\mcps\\time_tools.py"],
    }

    client, tools = await create_stdio_mcp_client(name="time_tools", params=params)
    return tools

