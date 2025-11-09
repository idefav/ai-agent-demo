from app.agent.utils.mcp_utils import create_stdio_mcp_client


async def get_stdio_shell_tools():
    params = {
        "command": "C:\\Users\\idefav\\Documents\\src\\ai-agent-demo\\.venv\\Scripts\\python.exe",
        "args": ["C:\\Users\\idefav\\Documents\\src\\ai-agent-demo\\app\\agent\\mcps\\shell_tools.py"],
    }

    client, tools = await create_stdio_mcp_client(name="shell_tools", params=params)
    return tools
