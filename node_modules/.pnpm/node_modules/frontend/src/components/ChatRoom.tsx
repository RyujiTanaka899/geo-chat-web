import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../hooks/useSocket'
import { NicknameForm } from './NicknameForm'

interface ChatMessage {
  sender: string
  nickname: string
  message: string
  timestamp: number
  system?: boolean
}

interface ChatRoomProps {
  roomId: string
  nickname: string
  onNicknameChange: (newNickname: string) => void
}

export function ChatRoom({ roomId, nickname, onNicknameChange }: ChatRoomProps) {
  const socket = useSocket(roomId, nickname)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // 参加・退出通知
  useEffect(() => {
    socket.emit('join-room', { roomId, nickname })
    return () => {
      socket.emit('leave-room', { roomId, nickname })
    }
  }, [socket, roomId, nickname])

  // メッセージ受信
  useEffect(() => {
    socket.on('chat-message', (data: ChatMessage) => {
      setMessages(prev => [...prev, { ...data, system: false }])
    })
    socket.on('user-joined', ({ userId, nickname: nm, timestamp }) => {
      setMessages(prev => [
        ...prev,
        { sender: userId, nickname: nm, message: `${nm} joined`, timestamp, system: true }
      ])
    })
    socket.on('user-left', ({ userId, nickname: nm, timestamp }) => {
      setMessages(prev => [
        ...prev,
        { sender: userId, nickname: nm, message: `${nm} left`, timestamp, system: true }
      ])
    })

    return () => {
      socket.off('chat-message')
      socket.off('user-joined')
      socket.off('user-left')
    }
  }, [socket])

  // メッセージ送信
  const sendMessage = () => {
    if (!input.trim()) return
    socket.emit('chat-message', { roomId, message: input.trim(), nickname })
    setInput('')
  }

  // ニックネーム変更ハンドラ
  const handleNicknameChange = (newNick: string) => {
    socket.emit('leave-room', { roomId, nickname })
    onNicknameChange(newNick)
    socket.emit('join-room', { roomId, nickname: newNick })
    setIsEditing(false)
  }

  // 自動スクロール
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto my-6 p-4 bg-white shadow-lg rounded-lg">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold">Room: {roomId}</h2>
        {isEditing ? (
          <NicknameForm
            current={nickname}
            onSubmit={handleNicknameChange}
          />
        ) : (
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => setIsEditing(true)}
          >
            ニックネーム変更
          </button>
        )}
      </div>

      {/* メッセージリスト */}
      <div className="h-64 sm:h-80 md:h-96 overflow-y-auto bg-gray-50 p-4 rounded space-y-2">
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

      {/* 入力エリア */}
      <div className="flex flex-col sm:flex-row mt-4">
        <input
          className="flex-1 border border-gray-300 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none px-3 py-2 focus:outline-none"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message…"
        />
        <button
          onClick={sendMessage}
          className="mt-2 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  )
}
