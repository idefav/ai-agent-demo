from langchain_ollama.llms import OllamaLLM
import os

from langchain_ollama.chat_models import ChatOllama
from pyexpat.errors import messages


def main():
    print("Hello from ai-agent-demo!")
    Chat()


def Chat():
    llm = ChatOllama(model=os.getenv("MODEL_NAME", "deepseek-r1:7b"))
    messages = [
        ('system', os.getenv("SYSTEM_MESSAGE", 'You are a helpful assistant that translates English to French.')),
        ('user', os.getenv("USER_MESSAGE", 'Translate the following English text to French: "Hello, how are you?"'))
    ]
    resp = llm.stream(messages)
    for chunk in resp:
        print(chunk.content, end="")


if __name__ == "__main__":
    main()
