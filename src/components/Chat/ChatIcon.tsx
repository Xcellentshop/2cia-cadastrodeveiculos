import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

const ChatIcon = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <ChatWindow />}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>
    </>
  );
};

export default ChatIcon;
