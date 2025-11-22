import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { fetchAssistants, createThread, streamRun, fetchThreads, fetchThreadState, cancelRun } from './services/api';
import { MESSAGES, BROWSER_CONFIG } from './constants/messages';
import MessageList from './components/Chat/MessageList';
import MessageInput from './components/Chat/MessageInput';
import Sidebar from './components/Sidebar/Sidebar';
import AdminPage from './pages/AdminPage';
import { MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

function ChatApp() {
  const inputRef = React.useRef();
  const [messages, setMessages] = useState([]);
  const [threadId, setThreadId] = useState(null);
  const [assistantId, setAssistantId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threads, setThreads] = useState([]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const navigate = useNavigate();

  const abortController = React.useRef(null);
  const currentRunId = React.useRef(null);

  const loadThreads = async () => {
    try {
      const data = await fetchThreads();
      if (data && Array.isArray(data)) {
        setThreads(data);
      }
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
  };

  const init = async () => {
    try {
      // 1. Fetch assistants
      const assistants = await fetchAssistants();
      if (assistants && assistants.length > 0) {
        setAssistantId(assistants[0].assistant_id);
      } else {
        console.warn('No assistants found');
      }

      // 2. Load threads
      await loadThreads();

      // 3. Show welcome message without creating a thread
      setMessages([MESSAGES.WELCOME]);

    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to connect to the AI agent. Please ensure the backend is running.');
    }
  };

  useEffect(() => {
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNewChat = async () => {
    setThreadId(null);
    setMessages([MESSAGES.WELCOME]);
    setError(null);
    if (inputRef.current) inputRef.current.clearInput();
  };

  const handleSelectThread = async (id) => {
    if (id === threadId) return;

    setThreadId(id);
    setIsLoading(true);
    setError(null);

    try {
      const state = await fetchThreadState(id);
      // Parse state values to messages
      // State.values usually contains the messages list if using standard LangGraph messages state
      // It depends on the graph schema.
      // Assuming 'messages' key in values.

      if (state.values && state.values.messages) {
        // LangGraph messages might be objects with 'type' or 'role'
        // We need to map them to our format { role, content }
        // Standard LangChain messages: { type: 'human'|'ai', content: '...' }

        const mappedMessages = state.values.messages.map(msg => {
          let role = 'user';
          if (msg.type === 'ai' || msg.type === 'assistant') role = 'assistant';
          // Sometimes it's just 'role' property
          if (msg.role) role = msg.role;

          return {
            role: role,
            content: msg.content || '',
            tool_calls: msg.tool_calls || []
          };
        });
        setMessages(mappedMessages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading thread:', err);
      setError('Failed to load conversation history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    if (currentRunId.current && threadId) {
      try {
        await cancelRun(threadId, currentRunId.current);
      } catch (e) {
        console.error("Failed to cancel run on server:", e);
      }
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (text) => {
    if (!assistantId) {
      setError(MESSAGES.ERRORS.NOT_INITIALIZED);
      return;
    }

    // Create thread on first message if not exists
    let currentThreadId = threadId;
    if (!currentThreadId) {
      setMessages(prev => [...prev, MESSAGES.CREATING_THREAD]);
      setIsLoading(true);
      try {
        const thread = await createThread();
        currentThreadId = thread.thread_id;
        setThreadId(currentThreadId);
        setMessages(prev => prev.filter(msg => msg.role !== 'system'));
      } catch (err) {
        console.error('Error creating thread:', err);
        setError(MESSAGES.ERRORS.THREAD_CREATE_FAILED);
        setIsLoading(false);
        setMessages(prev => prev.filter(msg => msg.role !== 'system'));
        return;
      }
    }

    // Optimistic update
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    abortController.current = new AbortController();
    currentRunId.current = null;

    // Track processed message IDs to avoid duplicates and know when to update vs append
    const processedMessageIds = new Set();

    await streamRun(
      currentThreadId,
      assistantId,
      text,
      (chunk, eventType) => {
        // Handle chunk - chunk is now the full message object
        const content = chunk.content || '';
        const toolCalls = chunk.tool_calls || [];
        const msgId = chunk.id;
        const toolCallId = chunk.tool_call_id;

        // Map type to role if role is missing
        let role = chunk.role;
        if (!role) {
          if (chunk.type === 'tool') role = 'tool';
          else if (chunk.type === 'ai' || chunk.type === 'assistant') role = 'assistant';
          else if (chunk.type === 'human' || chunk.type === 'user') role = 'user';
          else role = 'assistant'; // Default fallback
        }

        // If this is a completion event for a tool, ensure we treat it as a tool message
        if (eventType === 'messages/complete' && chunk.type === 'tool') {
          role = 'tool';
        }

        setMessages(prev => {
          const newMsgs = [...prev];

          // Show browser panel when tool calls are detected
          if (toolCalls && toolCalls.length > 0) {
            setShowBrowser(true);
          }

          // If we have an ID, try to find existing message
          if (msgId) {
            const existingIndex = newMsgs.findIndex(m => m.id === msgId);

            if (existingIndex !== -1) {
              // Update existing message
              newMsgs[existingIndex] = {
                ...newMsgs[existingIndex],
                content: content,
                tool_calls: toolCalls,
                role: role,
                tool_call_id: toolCallId
              };
            } else {
              // New message with ID
              newMsgs.push({
                id: msgId,
                role: role,
                content: content,
                tool_calls: toolCalls,
                tool_call_id: toolCallId
              });
              processedMessageIds.add(msgId);
            }
          } else {
            // Fallback for messages without ID (shouldn't happen often with LangGraph)
            // We'll assume it updates the last assistant message if it exists and we haven't seen this "chunk" before as a new message
            // But since we can't reliably track without ID, we might just append if it looks like a new turn?
            // For safety, let's stick to the old logic ONLY if no ID is present.

            const last = newMsgs[newMsgs.length - 1];
            if (last && last.role === 'assistant' && !last.id) {
              last.content = content;
              last.tool_calls = toolCalls;
            } else {
              newMsgs.push({
                role: role,
                content: content,
                tool_calls: toolCalls,
                tool_call_id: toolCallId
              });
            }
          }
          return newMsgs;
        });
      },
      () => {
        setIsLoading(false);
        loadThreads(); // Refresh thread list to update timestamp/preview
        abortController.current = null;
        currentRunId.current = null;
      },
      (err) => {
        console.error('Stream error:', err);
        setError('Error receiving response.');
        setIsLoading(false);
        abortController.current = null;
        currentRunId.current = null;
      },
      {
        signal: abortController.current.signal,
        onRunId: (id) => currentRunId.current = id
      }
    );
  };

  return (
    <div className="app-container">
      <Sidebar
        threads={threads}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onAdmin={() => navigate('/admin')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="main-content">
        <header className="header">
          <div className="avatar" style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)' }}>
            <MessageSquare size={20} color="white" />
          </div>
          <h1>AI Assistant</h1>
        </header>

        <div className="chat-container">
          <MessageList messages={messages} isLoading={isLoading} />
          {error && (
            <div style={{ padding: '10px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <MessageInput ref={inputRef} onSend={handleSendMessage} onStop={handleStop} disabled={false} isLoading={isLoading} />
        </div>
      </div>

      {showBrowser && (
        <div className="browser-panel">
          <div className="browser-header">
            <h3>浏览器</h3>
            <button 
              className="close-browser-btn" 
              onClick={() => setShowBrowser(false)}
              title="关闭浏览器"
            >
              ✕
            </button>
          </div>
          <iframe
            src={BROWSER_CONFIG.VNC_URL}
            className="browser-iframe"
            title="VNC Browser"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
