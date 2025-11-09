from mcp.server import FastMCP

mcp = FastMCP("Math Tools")

@mcp.tool(name="add", description="Add two numbers together.")
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b

@mcp.tool(name="multiply", description="Multiply two numbers together.")
def multiply(a: int, b: int) -> int:
    """Multiply two numbers together."""
    return a * b


# 除法工具
@mcp.tool(name="divide", description="Divide two numbers.")
def divide(a: float, b: float) -> float:
    """Divide two numbers."""
    if b == 0:
        raise ValueError("Cannot divide by zero.")
    return a / b


# 减法工具
@mcp.tool(name="subtract", description="Subtract two numbers.")
def subtract(a: int, b: int) -> int:
    """Subtract two numbers."""
    return a - b

if __name__ == "__main__":
    mcp.run(transport="stdio")