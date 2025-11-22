import React, { useState, useEffect } from 'react';
import { searchStoreItems, putStoreItem, deleteStoreItem } from '../../services/api';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';

const StoreManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState({ namespace: '', key: '', value: '' });

    const loadItems = async () => {
        setLoading(true);
        try {
            console.log("Loading store items...");
            const data = await searchStoreItems(null); // null query for all items
            console.log("Store items data:", data);
            if (data && data.items) {
                setItems(data.items);
            } else {
                console.warn("No items found in response:", data);
            }
        } catch (err) {
            console.error("Failed to load store items:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleDelete = async (namespace, key) => {
        if (window.confirm(`Are you sure you want to delete item ${key}?`)) {
            try {
                await deleteStoreItem(namespace, key);
                loadItems();
            } catch (err) {
                console.error("Failed to delete item:", err);
            }
        }
    };

    const handleSave = async () => {
        try {
            let parsedValue;
            try {
                parsedValue = JSON.parse(currentItem.value);
            } catch (e) {
                alert("Value must be valid JSON");
                return;
            }

            // Namespace should be an array of strings
            const namespaceArray = currentItem.namespace.split(',').map(s => s.trim());

            await putStoreItem(namespaceArray, currentItem.key, parsedValue);
            setIsEditing(false);
            setCurrentItem({ namespace: '', key: '', value: '' });
            loadItems();
        } catch (err) {
            console.error("Failed to save item:", err);
            alert("Failed to save item");
        }
    };

    const openEdit = (item) => {
        setCurrentItem({
            namespace: item.namespace.join(', '),
            key: item.key,
            value: JSON.stringify(item.value, null, 2)
        });
        setIsEditing(true);
    };

    const openNew = () => {
        setCurrentItem({ namespace: '', key: '', value: '{}' });
        setIsEditing(true);
    };

    return (
        <div className="store-manager" style={{ padding: '20px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2>Long-term Memory Store</h2>
                <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: '#6366f1', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
                    <Plus size={16} /> Add Item
                </button>
            </div>

            {isEditing && (
                <div className="edit-modal" style={{ background: '#1e293b', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #475569' }}>
                    <h3>{currentItem.key ? 'Edit Item' : 'New Item'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            placeholder="Namespace (comma separated)"
                            value={currentItem.namespace}
                            onChange={e => setCurrentItem({ ...currentItem, namespace: e.target.value })}
                            style={{ background: '#334155', border: 'none', padding: '10px', color: 'white', borderRadius: '4px' }}
                        />
                        <input
                            placeholder="Key"
                            value={currentItem.key}
                            onChange={e => setCurrentItem({ ...currentItem, key: e.target.value })}
                            style={{ background: '#334155', border: 'none', padding: '10px', color: 'white', borderRadius: '4px' }}
                        />
                        <textarea
                            placeholder="Value (JSON)"
                            value={currentItem.value}
                            onChange={e => setCurrentItem({ ...currentItem, value: e.target.value })}
                            rows={10}
                            style={{ background: '#334155', border: 'none', padding: '10px', color: 'white', borderRadius: '4px', fontFamily: 'monospace' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSave} style={{ padding: '8px 16px', background: '#22c55e', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="items-list" style={{ display: 'grid', gap: '10px' }}>
                {items.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.namespace.join(' > ')}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.key}</div>
                            <pre style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '5px', maxHeight: '100px', overflow: 'hidden' }}>
                                {JSON.stringify(item.value, null, 2)}
                            </pre>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => openEdit(item)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}><Edit size={18} /></button>
                            <button onClick={() => handleDelete(item.namespace, item.key)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && !loading && <div style={{ color: '#94a3b8', textAlign: 'center' }}>No items found in store.</div>}
            </div>
        </div>
    );
};

export default StoreManager;
