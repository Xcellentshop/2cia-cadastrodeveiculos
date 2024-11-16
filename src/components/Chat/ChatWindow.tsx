import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';

const ChatWindow = () => {
  const { messages, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg w-96">
      <div className="p-4">
        <h3 className="font-bold text-lg">Chat</h3>
        <div className="mt-4 h-64 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.user === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${msg.user === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-l-lg p-2"
            placeholder="Digite a placa do veículo..."
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded-r-lg">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
