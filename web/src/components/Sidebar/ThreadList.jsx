import React from 'react';
import ThreadItem from './ThreadItem';

const ThreadList = ({ threads, activeThreadId, onSelectThread }) => {
    return (
        <div className="thread-list">
            {threads.length === 0 && (
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#9ca3af', 
                    fontSize: '0.875rem', 
                    lineHeight: '1.5' 
                }}>
                    <div>还没有对话记录</div>
                    <div style={{ marginTop: '8px', color: '#d1d5db' }}>
                        点击上方 <span style={{ fontWeight: 'bold', color: '#9ca3af' }}>＋ New Chat</span> 开始新对话
                    </div>
                </div>
            )}
            {threads.map(thread => (
                <ThreadItem
                    key={thread.thread_id}
                    thread={thread}
                    isActive={thread.thread_id === activeThreadId}
                    onClick={onSelectThread}
                />
            ))}
        </div>
    );
};

export default ThreadList;
