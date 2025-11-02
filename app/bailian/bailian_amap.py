import asyncio

from langchain.agents import create_agent
from langchain_core.prompts import PromptTemplate

from app.bailian.common import llm
from app.bailian.mcp_clients.amap_mcp_client import create_mcp_client
from app.common.init import initEnvironment
from langchain_community.agent_toolkits import FileManagementToolkit

initEnvironment()


async def main():
    file_toolkit = FileManagementToolkit(root_dir="C:/Users/idefav/Documents/ai_work")
    file_tools = file_toolkit.get_tools()
    client, tools = await create_mcp_client()
    agent = create_agent(model=llm, tools=tools + file_tools, debug=True)

    prompt_template = PromptTemplate.from_template(
        "你是一个智能助手，可以调用高德 MCP 工具。\n\n问题: {input}"
    )

    prompt = prompt_template.format(input="""
    - 我11月中计划从上海自驾去黄山旅游5天。
    - 帮制作旅行攻略，考虑出行时间和路线，以及天气状况路线规划, 还有酒店住宿等信息。
    - 制作网页地图自定义绘制旅游路线和位置。
        - 网页使用简约美观页面风格,景区图片以卡片展示。
    - 行程规划结果在高德地图app展示，并集成到h5页面中。
    - 同一天行程景区之间我想打车前往。
    
    将网页保存到 C:/Users/idefav/Documents/ai_work/huangshan/ 文件夹，文件名为 index2.html。
    """)
    resp = await agent.ainvoke(
        {"messages": [{"role": "user", "content": prompt}]},
        config={"recursion_limit": 50}
    )

    print(resp)


asyncio.run(main())
