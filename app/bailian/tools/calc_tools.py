from langchain_core.tools import tool
from pydantic import BaseModel, Field


class AddInputArgs(BaseModel):
    a: int =Field(description="first number")
    b: int =Field(description="second number")

@tool(description="Add two numbers together.", args_schema=AddInputArgs, return_direct=True)
def add(a : int, b : int) -> int:
    """Add two numbers together."""
    return a + b


def create_calc_tools():
    return [add]


calc_tools = create_calc_tools()