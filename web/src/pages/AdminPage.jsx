import React, { useState, useEffect } from 'react';
import GraphView from '../components/Admin/GraphView';
import StoreManager from '../components/Admin/StoreManager';
import { fetchAssistants } from '../services/api';
import { LayoutDashboard, Database, Activity } from 'lucide-react';

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('graph');
    const [assistantId, setAssistantId] = useState(null);

    useEffect(() => {
        const loadAssistant = async () => {
            try {
                const assistants = await fetchAssistants();
                if (assistants && assistants.length > 0) {
                    setAssistantId(assistants[0].assistant_id);
                }
            } catch (e) {
                console.error("Failed to load assistant for admin view", e);
            }
        };
        loadAssistant();
    }, []);

    return (
        <div className="admin-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', color: 'white' }}>
            <header style={{ padding: '20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <LayoutDashboard size={24} color="#a78bfa" />
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Admin Dashboard</h1>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <aside style={{ width: '250px', background: '#1e293b', borderRight: '1px solid #334155', padding: '20px' }}>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                            onClick={() => setActiveTab('graph')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                                background: activeTab === 'graph' ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
                                color: activeTab === 'graph' ? '#a78bfa' : '#94a3b8',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem'
                            }}
                        >
                            <Activity size={20} /> Graph View
                        </button>
                        <button
                            onClick={() => setActiveTab('store')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                                background: activeTab === 'store' ? 'rgba(167, 139, 250, 0.2)' : 'transparent',
                                color: activeTab === 'store' ? '#a78bfa' : '#94a3b8',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem'
                            }}
                        >
                            <Database size={20} /> Memory Store
                        </button>
                    </nav>
                </aside>

                <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    {activeTab === 'graph' && (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ marginBottom: '20px' }}>Graph Visualization</h2>
                            <div style={{ flex: 1, border: '1px solid #334155', borderRadius: '12px' }}>
                                {assistantId ? <GraphView assistantId={assistantId} /> : <p>Loading assistant...</p>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'store' && <StoreManager />}
                </main>
            </div>
        </div>
    );
};

export default AdminPage;
