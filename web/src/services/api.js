const API_BASE_URL = '/api';

export const fetchAssistants = async () => {
    const response = await fetch(`${API_BASE_URL}/assistants/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 1 }),
    });
    if (!response.ok) throw new Error('Failed to fetch assistants');
    return response.json();
};

export const fetchThreads = async () => {
    const response = await fetch(`${API_BASE_URL}/threads/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 50, sort_by: 'updated_at', sort_order: 'desc' }),
    });
    if (!response.ok) throw new Error('Failed to fetch threads');
    return response.json();
};

export const fetchThreadState = async (threadId) => {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/state`, {
        method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch thread state');
    return response.json();
};

export const createThread = async () => {
    const response = await fetch(`${API_BASE_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });
    if (!response.ok) throw new Error('Failed to create thread');
    return response.json();
};

export const streamRun = async (threadId, assistantId, input, onChunk, onDone, onError, { signal, onRunId } = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/threads/${threadId}/runs/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                assistant_id: assistantId,
                input: { messages: [{ role: 'user', content: input }] },
                stream_mode: ['messages'],
            }),
            signal,
        });

        if (!response.ok) throw new Error('Failed to start run');

        // Extract run_id from Content-Location header if available
        // Example: /threads/{thread_id}/runs/{run_id}/stream
        const contentLocation = response.headers.get('Content-Location');
        if (contentLocation && onRunId) {
            const match = contentLocation.match(/\/runs\/([a-f0-9-]+)\/stream/);
            if (match && match[1]) {
                onRunId(match[1]);
            }
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let currentEventType = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('event: ')) {
                    currentEventType = line.slice(7).trim();
                } else if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));

                        // Extract message data with tool calls support
                        let messageData = null;

                        if (Array.isArray(data) && data.length > 0) {
                            messageData = data[data.length - 1];
                        } else if (data.content || data.tool_calls) {
                            messageData = data;
                        } else if (data.messages && Array.isArray(data.messages)) {
                            messageData = data.messages[data.messages.length - 1];
                        }

                        // Pass the full message data including tool_calls and event type
                        if (messageData) {
                            onChunk(messageData, currentEventType);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE data:', e);
                    }
                }
            }
        }
        onDone();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Stream aborted');
        } else {
            onError(error);
        }
    }
};

export const cancelRun = async (threadId, runId) => {
    const response = await fetch(`${API_BASE_URL}/threads/${threadId}/runs/${runId}/cancel`, {
        method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to cancel run');
    return response.json();
};

export const fetchAssistantGraph = async (assistantId) => {
    const response = await fetch(`${API_BASE_URL}/assistants/${assistantId}/graph`, {
        method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to fetch assistant graph');
    return response.json();
};

export const searchStoreItems = async (namespacePrefix = [], limit = 10, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/store/items/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            namespace_prefix: namespacePrefix || [],
            limit,
            offset
        }),
    });
    if (!response.ok) throw new Error('Failed to search store items');
    return response.json();
};

export const putStoreItem = async (namespace, key, value) => {
    console.log("putStoreItem called with:", { namespace, key, value });
    const response = await fetch(`${API_BASE_URL}/store/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace, key, value }),
    });
    console.log("putStoreItem response status:", response.status);
    if (!response.ok) {
        const text = await response.text();
        console.error("putStoreItem failed:", text);
        throw new Error('Failed to put store item');
    }
    return response.ok;
};

export const deleteStoreItem = async (namespace, key) => {
    const response = await fetch(`${API_BASE_URL}/store/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace, key }),
    });
    if (!response.ok) throw new Error('Failed to delete store item');
    return response.ok;
};
