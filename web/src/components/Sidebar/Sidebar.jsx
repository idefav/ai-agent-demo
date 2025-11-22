import React from 'react';
import { Plus, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import ThreadList from './ThreadList';

const Sidebar = ({ threads, activeThreadId, onSelectThread, onNewChat, onAdmin, collapsed, onToggleCollapse }) => {
    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <button 
                className="sidebar-toggle"
                onClick={onToggleCollapse}
                title={collapsed ? "展开侧边栏" : "折叠侧边栏"}
            >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button className="new-chat-btn" onClick={onNewChat}>
                <Plus size={20} />
                <span>New Chat</span>
            </button>
            <div className="sidebar-divider"></div>
            <ThreadList
                threads={threads}
                activeThreadId={activeThreadId}
                onSelectThread={onSelectThread}
            />
            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={onAdmin}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px',
                        background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer',
                        borderRadius: '8px', transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <Settings size={18} />
                    <span>Admin Dashboard</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
