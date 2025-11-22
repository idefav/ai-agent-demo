export const MESSAGES = {
  WELCOME: { 
    role: 'assistant', 
    content: '你好！我是你的 AI 助手，输入消息开始对话吧！' 
  },
  CREATING_THREAD: { 
    role: 'system', 
    content: '正在创建会话...' 
  },
  ERRORS: {
    THREAD_CREATE_FAILED: '创建会话失败，请重试',
    NOT_INITIALIZED: 'Chat not initialized properly.'
  }
};

// Browser configuration
// 浏览器配置 - 用于显示工具调用时的VNC浏览器窗口
// 可以根据实际环境修改URL
export const BROWSER_CONFIG = {
  // VNC浏览器连接URL
  // 默认连接参数说明：
  // - autoconnect=true: 自动连接
  // - resize=scale: 自动缩放适应窗口
  // - reconnect=1: 断线自动重连
  // - path=websockify: WebSocket路径
  VNC_URL: 'http://localhost:48080/vnc/index.html?autoconnect=true&resize=scale&reconnect=1&path=websockify'
};
