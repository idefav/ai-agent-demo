from langchain.agents import create_agent
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate

from app.bailian.common import llm
from app.bailian.tools.calc_tools import calc_tools
from app.bailian.tools.python_tool import PythonREPLTool

# 创建工具实例而不是类
python_repl_tool = PythonREPLTool()
tools = [python_repl_tool]
tool_names = ["PythonREPLTool"]

agent = create_agent(model=llm, tools=tools, debug=True)

question="""
要求:
1. 向 C:/Users/idefav/Documents/ai_work 文件夹写入文件, 文件名为: index.html
2. 写一个企业官网
"""

# question="在 C:/Users/idefav/Documents/ai_work 文件夹创建一个 2.txt文件, 写入当前时间."

prompt_template = PromptTemplate.from_template(template="""
你是一位编程专家，擅长使用Python编程语言回答用户的问题。你可以使用提供的工具来帮助你完成任务。请根据用户的问题，选择合适的工具进行计算或编程，并返回结果。
你可以使用的工具有: {tool_names}
-- 
可以按照下面的格式进行思考:

```
# 思考的过程
- 问题: 你必须回答的问题
- 思考: 你考虑应该怎么做
- 行动: 要采取的行动, 应该是 [{tool_names}] 其中一个
- 行动输入: 你要传递给工具的输入
- 观察: 工具返回的结果
- 思考: 你对观察结果的思考
... (这个思考/行动/行动输入/观察的过程可以重复多次)
- 最终答案: 根据上面的思考，给出最终的答案
```

--
- 请注意:
1. 每次只能使用一个工具。
2. {tool_names} 的输入是一个段Python代码, 不允许添加 ```python 或者 ```py 等代码标记。

--
问题: {question}
""")

# 生成提示词
prompt = prompt_template.format(tool_names=", ".join(tool_names), question=question)

resp = agent.invoke({"messages": [
    {"role": "user", "content": prompt},
   ]})

print(resp["messages"])
for message in resp["messages"]:
    print(message)
