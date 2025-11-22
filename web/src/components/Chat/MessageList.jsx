import React, { useEffect, useRef } from 'react';
import { User, Bot, Wrench } from 'lucide-react';
import TypingIndicator from './TypingIndicator';
import ToolCallMessage from './ToolCallMessage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MessageList = ({ messages, isLoading }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Process messages to group tool results with tool calls
    const processMessages = (msgs) => {
        if (!msgs) return [];

        const processed = [];
        const toolCallMap = new Map(); // Map<tool_call_id, tool_call_object>

        // First pass: identify tool calls and add them to map
        // We need to clone objects to avoid mutating props
        msgs.forEach(msg => {
            if (msg.role === 'assistant' && msg.tool_calls) {
                const newMsg = { ...msg, tool_calls: msg.tool_calls.map(tc => ({ ...tc })) };
                newMsg.tool_calls.forEach(tc => {
                    if (tc.id) {
                        toolCallMap.set(tc.id, tc);
                    }
                });
                processed.push(newMsg);
            } else if (msg.role === 'tool') {
                // Try to find parent tool call
                const toolCallId = msg.tool_call_id || msg.id; // Fallback if id is used
                const parentToolCall = toolCallMap.get(toolCallId);

                if (parentToolCall) {
                    parentToolCall.result = msg.content;
                    parentToolCall.status = 'success';
                } else {
                    // If no parent found (shouldn't happen usually), keep it as is
                    // or maybe we want to hide it? Let's keep it for now if orphan
                    processed.push(msg);
                }
            } else {
                processed.push(msg);
            }
        });

        return processed;
    };

    const processedMessages = processMessages(messages);

    return (
        <div className="messages-area">
            {processedMessages.map((msg, index) => {
                // Check if message has tool calls
                const hasToolCalls = msg.tool_calls && Array.isArray(msg.tool_calls) && msg.tool_calls.length > 0;
                const hasContent = msg.content && msg.content.trim().length > 0;

                // Skip rendering if it's a tool message that was merged (though logic above filters them out)
                // But if we kept orphans, render them.
                // We also want to hide 'tool' role messages if they were successfully merged.
                // The logic above only pushes 'tool' messages if they were NOT merged.

                // Handle system messages
                if (msg.role === 'system') {
                    return (
                        <div key={index} style={{ 
                            textAlign: 'center', 
                            padding: '12px', 
                            color: '#9ca3af', 
                            fontSize: '0.875rem', 
                            fontStyle: 'italic',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            margin: '8px 0'
                        }}>
                            {msg.content}
                        </div>
                    );
                }

                return (
                    <div key={index} className={`message ${msg.role === 'user' ? 'user' : 'ai'} ${msg.role === 'tool' ? 'tool-result' : ''}`}>
                        <div className="avatar">
                            {msg.role === 'user' ? <User size={20} color="white" /> : (msg.role === 'tool' ? <Wrench size={20} color="white" /> : <Bot size={20} color="white" />)}
                        </div>
                        <div className="message-content">
                            {/* Render text content */}
                            {hasContent && (
                                msg.role === 'user' ? (
                                    <div>{msg.content}</div>
                                ) : (
                                    <ReactMarkdown
                                        children={msg.content}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        {...props}
                                                        children={String(children).replace(/\n$/, '')}
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                    />
                                                ) : (
                                                    <code {...props} className={className}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    />
                                )
                            )}

                            {/* Render tool calls */}
                            {hasToolCalls && (
                                <div className="tool-calls-container">
                                    {msg.tool_calls.map((toolCall, idx) => (
                                        <ToolCallMessage key={toolCall.id || idx} toolCall={toolCall} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            {isLoading && (
                <div className="message ai">
                    <div className="avatar">
                        <Bot size={20} color="white" />
                    </div>
                    <div className="message-content">
                        <TypingIndicator />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
