// frontend/src/components/NicknameForm.tsx
import { useState } from 'react';

interface Props {
  onSubmit: (nickname: string) => void;
}

export function NicknameForm({ onSubmit }: Props) {
  const [value, setValue] = useState('');

  const handle = () => {
    // 空文字なら自動生成
    const nick = value.trim() || `User${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('geoChatNickname', nick);
    onSubmit(nick);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">ニックネームを入力してください</h1>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="例：Taro123"
        className="border p-2 rounded w-64 mb-4"
      />
      <button
        onClick={handle}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        決定
      </button>
    </div>
  );
}
