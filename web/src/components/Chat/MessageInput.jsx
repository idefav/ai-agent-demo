import React, { useState } from 'react';
import { Send, Square } from 'lucide-react';

const MessageInput = React.forwardRef(({ onSend, onStop, disabled, isLoading }, ref) => {
    const [input, setInput] = useState('');

    React.useImperativeHandle(ref, () => ({
        clearInput: () => setInput('')
    }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !disabled && !isLoading) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div className="input-area">
            <form className="input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={disabled || isLoading}
                />
                {isLoading ? (
                    <button type="button" className="send-button stop-button" onClick={onStop}>
                        <Square size={20} fill="white" />
                    </button>
                ) : (
                    <button type="submit" className="send-button" disabled={!input.trim() || disabled}>
                        <Send size={20} />
                    </button>
                )}
            </form>
        </div>
    );
});

export default MessageInput;
