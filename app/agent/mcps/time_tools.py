import time

from mcp.server import FastMCP

mcp = FastMCP()

@mcp.tool(name="get_current_time", description="Get the current local time in YYYY-MM-DD HH:MM:SS format.")
def get_current_time():
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

if __name__ == "__main__":
    mcp.run(transport="stdio")