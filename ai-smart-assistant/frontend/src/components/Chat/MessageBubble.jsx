import React from 'react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-content" style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono, inherit)' }}>
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
