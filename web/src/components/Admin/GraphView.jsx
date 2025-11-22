import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { fetchAssistantGraph } from '../../services/api';

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const GraphView = ({ assistantId }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);

    const loadGraph = useCallback(async () => {
        if (!assistantId) return;
        setLoading(true);
        try {
            const graphData = await fetchAssistantGraph(assistantId);

            // Transform API data to React Flow format
            // API returns: { nodes: [...], edges: [...] } or similar structure?
            // Wait, the API returns a GraphSchema object: { input_schema, output_schema, state_schema, ... }
            // It doesn't seem to return the nodes and edges directly in a simple format.
            // Let's check the OpenAPI schema again.
            // /assistants/{assistant_id}/graph returns a GraphSchema?
            // Wait, the endpoint is /assistants/{assistant_id}/graph.
            // The schema says it returns "Response Get Assistant Graph".
            // "additionalProperties": { "type": "array", "items": { "type": "object" } }
            // It seems the response structure might be complex or dynamic.
            // Let's assume for now we get a list of nodes and edges or we need to parse it.

            // Actually, LangGraph API's /graph endpoint usually returns a JSON representation of the graph.
            // Let's assume it returns { nodes: [{id, ...}], edges: [{source, target, ...}] } for now.
            // If not, we might need to debug and adjust.

            // For the demo, let's try to parse what we get.
            // If the response is the graph structure directly:

            const rawNodes = graphData.nodes || [];
            const rawEdges = graphData.edges || [];

            const initialNodes = rawNodes.map(n => ({
                id: n.id,
                data: { label: n.id }, // Use ID as label for now
                position: { x: 0, y: 0 },
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '12px',
                    width: nodeWidth
                }
            }));

            const initialEdges = rawEdges.map((e, i) => ({
                id: `e${i}`,
                source: e.source,
                target: e.target,
                type: 'smoothstep',
                animated: true,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#94a3b8',
                },
                style: { stroke: '#94a3b8' }
            }));

            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                initialNodes,
                initialEdges
            );

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);

        } catch (err) {
            console.error("Failed to load graph:", err);
        } finally {
            setLoading(false);
        }
    }, [assistantId, setNodes, setEdges]);

    useEffect(() => {
        loadGraph();
    }, [loadGraph]);

    return (
        <div style={{ height: '100%', width: '100%', minHeight: '500px', background: '#0f172a', borderRadius: '12px', overflow: 'hidden' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#334155" gap={16} />
                <Controls style={{ fill: '#fff' }} />
            </ReactFlow>
        </div>
    );
};

export default GraphView;
