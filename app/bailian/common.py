# 加载环境变量
import os

from langchain_openai import ChatOpenAI
from pydantic import SecretStr

from app.common.init import initEnvironment

initEnvironment()

# 初始化大模型
llm = ChatOpenAI(model="qwen3-max", api_key=SecretStr(os.getenv('DASHSCOPE_API_KEY')),
                 base_url=os.getenv('DASHSCOPE_BASE_URL'),
                 streaming=True)