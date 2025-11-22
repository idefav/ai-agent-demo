import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Wrench, CheckCircle, XCircle, Clock, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ToolCallMessage = ({ toolCall }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copiedArgs, setCopiedArgs] = useState(false);
    const [copiedResult, setCopiedResult] = useState(false);

    // Parse tool call data
    const { name, args, id, type, status = 'pending', result } = toolCall;

    // Determine status icon and color
    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle size={16} className="tool-status-icon success" />;
            case 'error':
                return <XCircle size={16} className="tool-status-icon error" />;
            case 'pending':
            default:
                return <Clock size={16} className="tool-status-icon pending" />;
        }
    };

    // Format arguments for display
    const formattedArgs = typeof args === 'string' ? args : JSON.stringify(args, null, 2);
    const formattedResult = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

    const copyToClipboard = async (text, setCopied) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={`tool-call-message ${status}`}>
            <div className="tool-call-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="tool-call-title">
                    <div className="tool-icon-wrapper">
                        <Wrench size={14} className="tool-icon" />
                    </div>
                    <span className="tool-name">{name || type || 'Tool Call'}</span>
                    <div className="tool-status-badge">
                        {getStatusIcon()}
                        <span className="tool-status-text">{status}</span>
                    </div>
                </div>
                <div className={`tool-expand-icon ${isExpanded ? 'expanded' : ''}`}>
                    <ChevronDown size={16} />
                </div>
            </div>

            {isExpanded && (
                <div className="tool-call-details">
                    {args && (
                        <div className="tool-call-section">
                            <div className="tool-section-header">
                                <span className="tool-call-label">Arguments</span>
                                <button
                                    className="copy-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(formattedArgs, setCopiedArgs);
                                    }}
                                    title="Copy arguments"
                                >
                                    {copiedArgs ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="code-block-wrapper">
                                <SyntaxHighlighter
                                    language="json"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                        maxWidth: '100%',
                                        overflowX: 'auto'
                                    }}
                                    wrapLongLines={true}
                                    PreTag="pre"
                                >
                                    {formattedArgs}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="tool-call-section">
                            <div className="tool-section-header">
                                <span className="tool-call-label">Result</span>
                                <button
                                    className="copy-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(formattedResult, setCopiedResult);
                                    }}
                                    title="Copy result"
                                >
                                    {copiedResult ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="code-block-wrapper">
                                <SyntaxHighlighter
                                    language="json"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                        maxWidth: '100%',
                                        overflowX: 'auto'
                                    }}
                                    wrapLongLines={true}
                                    PreTag="pre"
                                >
                                    {formattedResult}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}

                    {id && (
                        <div className="tool-call-meta">
                            <span className="meta-label">ID:</span>
                            <code className="meta-value">{id}</code>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ToolCallMessage;
