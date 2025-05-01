// App.tsx
import { useState, useEffect } from 'react'
import { useLocation } from './hooks/useLocation'
import { NicknameForm } from './components/NicknameForm'
import { ChatRoom } from './components/ChatRoom'
import './App.css'

function App() {
  const loc = useLocation()
  const [roomId, setRoomId] = useState<string>('')
  const [nickname, setNickname] = useState<string>('')    // ← ここで管理

  useEffect(() => {
    if (loc.isRiding && !roomId) {
      setRoomId(loc.roomId)
    } else if (!loc.isRiding) {
      setRoomId('')
      setNickname('')  // 乗車→降車でリセットしておくと再入力できる
    }
  }, [loc.isRiding, loc.roomId, roomId])

  // まだルームにも入ってなくて候補もなければ「検出中」を表示
  if (!loc.isRiding || !roomId) {
    return <p>乗車検出中…速度: {loc.speed.toFixed(1)} m/s</p>
  }

  // ルームIDはあるけど、ニックネーム未入力ならフォームを出す
  if (!nickname) {
    return (
      <div className="App">
        <p>Room: {roomId}</p>
        <NicknameForm
          current=""
          onSubmit={(newName) => setNickname(newName)}
        />
      </div>
    )
  }

  // ルームID と ニックネームが揃ったらチャット画面へ
  return (
    <ChatRoom
      roomId={roomId}
      nickname={nickname}
      onNicknameChange={(newName) => setNickname(newName)}  // ← ここで渡す
    />
  )
}

export default App
