import React from 'react';
import { MessageSquare } from 'lucide-react';

const ThreadItem = ({ thread, isActive, onClick }) => {
    const date = new Date(thread.updated_at);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div
            className={`thread-item ${isActive ? 'active' : ''}`}
            onClick={() => onClick(thread.thread_id)}
        >
            <MessageSquare size={16} className="thread-icon" />
            <div className="thread-info">
                <div className="thread-title">
                    {thread.metadata?.title || 'New Conversation'}
                </div>
                <div className="thread-time">{timeString}</div>
            </div>
        </div>
    );
};

export default ThreadItem;
