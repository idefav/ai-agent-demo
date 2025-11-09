import uuid

from langchain_community.chat_message_histories import FileChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableWithMessageHistory

from app.bailian.common import llm

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个技术专家，擅长解决各种Web开发中的技术问题."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "请帮我解决以下问题: {question}"),
])



chain = prompt | llm | StrOutputParser()


def get_session_history(session_id: str):
    return FileChatMessageHistory(f"../../tmp/sessions/{session_id}.json")



chat_with_history = RunnableWithMessageHistory(runnable=chain, input_messages_key="question",
                                     history_messages_key="chat_history", get_session_history=get_session_history)

def run_conversation():
    session_id = uuid.uuid4()
    while True:
        user_input = input("User: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        response = chat_with_history.stream(input={"question": user_input},
                                            config={"configurable": {"session_id": session_id}},)
        print("助手：")
        for chunk in response:
            print(chunk, end="")
        print("\n")


if __name__ == "__main__":
    run_conversation()