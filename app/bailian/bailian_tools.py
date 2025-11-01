import os

from langchain_core.prompts import ChatPromptTemplate, PromptTemplate, ChatMessagePromptTemplate
from langchain_core.tools import tool, Tool
from langchain_openai import ChatOpenAI

from app.bailian.common import llm
from app.common.init import initEnvironment
from pydantic import SecretStr, Field, BaseModel

# system_message = '你是一位{role}专家，擅长回答{domain}领域的问题。'
# human_message = '{question}'

system_template = ChatMessagePromptTemplate.from_template(template="你是一位{role}专家，擅长回答{domain}领域的问题。",
                                                          role="system")
human_template = ChatMessagePromptTemplate.from_template(template="{question}", role="user")

chat_prompt = ChatPromptTemplate.from_messages([system_template,
                                                human_template])

# print(chat_prompt)
#
# format_message = chat_prompt.format_messages(role="技术", domain="Web开发", question="如何构建一个基于Vue的前端应用?")
#
# print(format_message)

class AddInputArgs(BaseModel):
    a: int =Field(description="first number")
    b: int =Field(description="second number")

# @tool(description="Add two numbers together.", args_schema=AddInputArgs, return_direct=True)
def add(a: int, b: int) -> int:
    """Add two numbers together."""
    return a + b


add_tools = Tool.from_function(
    func=add,
    name="add",
    description="计算两个数相加"
)

llm_bind_tools = llm.bind_tools([add_tools])

chain = chat_prompt | llm_bind_tools

response = chain.invoke(input={"role": "数学", "domain": "数学计算", "question": "计算: 100+100"})

print(response)

tool_dict ={
    "add": add
}

for tool_call in response.tool_calls:
    print(f"Tool Call: {tool_call}")
    tool_name = tool_call["name"]
    print(f"Tool Name: {tool_name}")
    tool_args=tool_call["args"]
    print(f"Tool Arguments: {tool_args}")
    result = tool_dict[tool_name](int(tool_args["__arg1"]), int(tool_args["example_parameter_2"]))
    print(f"Tool Call Result: {result}")