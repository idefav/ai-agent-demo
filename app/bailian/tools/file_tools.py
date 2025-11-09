from langchain_community.agent_toolkits import FileManagementToolkit


def getFileTools(root_dir: str):
    tools = FileManagementToolkit(root_dir=root_dir)
    return tools.get_tools()

