import { useState, useEffect } from 'react';
import { useLocation } from './hooks/useLocation';
import { ChatRoom } from './components/ChatRoom';
import { NicknameForm } from './components/NicknameForm';
import './App.css';

function App() {
  // 位置フックは常に呼び出す
  const loc = useLocation();

  // ニックネーム管理
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('geoChatNickname');
    if (stored) setNickname(stored);
  }, []);

  // ニックネーム未設定時は入力フォームを表示
  if (!nickname) {
    return <NicknameForm onSubmit={setNickname} />;
  }

  // 乗車判定に応じてチャット画面のマウント/アンマウントを行い、自動退出ロジックを実現
  return (
    <div className="App">
      {loc.isRiding ? (
        <ChatRoom roomId={loc.roomId} />
      ) : (
        <p>乗車検出中…速度: {loc.speed.toFixed(1)} m/s</p>
      )}
    </div>
  );
}

export default App;
