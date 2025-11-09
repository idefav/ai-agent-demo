import subprocess

from mcp.server import FastMCP

mcp = FastMCP("Shell Tools")

@mcp.tool(name="run_shell_command", description="Run a shell command and return its output.")
def run_shell_command(command: str) -> str:
    try:
        response = subprocess.run(command, shell=True, capture_output=True, text=True)
        if response.returncode != 0:
            return f"Error: {response.stderr}"
        return response.stdout
    except Exception as e:
        return f"Exception occurred: {str(e)}"




if __name__ == "__main__":
    mcp.run(transport="stdio")