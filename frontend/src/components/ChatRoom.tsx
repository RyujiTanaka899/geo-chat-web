import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';

interface ChatMessage {
  sender: string;
  nickname: string;
  message: string;
  timestamp: number;
  system?: boolean;
}

interface ChatRoomProps {
  roomId: string;
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const socket = useSocket(roomId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // メッセージ受信
    socket.on('chat-message', (data: ChatMessage) => {
      setMessages(prev => [...prev, { ...data, system: false }]);
    });
    // 参加通知
    socket.on('user-joined', ({ userId, nickname, timestamp }) => {
      setMessages(prev => [
        ...prev,
        { sender: userId, nickname, message: `${nickname} joined`, timestamp, system: true }
      ]);
    });
    // 退出通知
    socket.on('user-left', ({ userId, nickname, timestamp }) => {
      setMessages(prev => [
        ...prev,
        { sender: userId, nickname, message: `${nickname} left`, timestamp, system: true }
      ]);
    });

    return () => {
      socket.off('chat-message');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket]);

  // 自動スクロール
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('chat-message', { roomId, message: input.trim() });
    setInput('');
  };

  return (
    <div className="max-w-md mx-auto my-6 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Room: {roomId}</h2>
      <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded space-y-2">
        {messages.map((m, i) =>
          m.system ? (
            <p key={i} className="text-center text-gray-500 text-sm">
              {m.message}
            </p>
          ) : (
            <div
              key={i}
              className={`flex ${m.sender === socket.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs break-words
                  ${m.sender === socket.id
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'}`
                }
              >
                <p className="text-[10px] font-bold mb-1">{m.nickname}</p>
                <p className="text-sm">{m.message}</p>
                <p className="text-[10px] text-gray-600 text-right mt-1">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )
        )}
        <div ref={endRef} />
      </div>
      <div className="flex mt-4">
        <input
          className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
