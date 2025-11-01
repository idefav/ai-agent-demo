from langchain.agents import create_agent
from langchain_core.prompts import ChatMessagePromptTemplate, ChatPromptTemplate

from app.bailian.common import llm
from app.bailian.tools.calc_tools import calc_tools


agent = create_agent(model=llm, tools=calc_tools, debug=True,)


result = agent.invoke({
    "messages":[
        {"role":"system","content":"你是一位数学专家，擅长回答数学领域的问题。"},
        {"role":"user","content":"计算: 100+100"}
    ]
})
print(result)
