// components/NicknameForm.tsx
import { useState } from 'react';

interface NicknameFormProps {
  /** 決定時に親コンポーネントに渡す */
  onSubmit: (name: string) => void;
  /** プレースホルダーや初期値が欲しければ追加してもOK */
}

export function NicknameForm({ onSubmit }: NicknameFormProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = input.trim();
    if (!name) return;
    onSubmit(name);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center mt-20">
      <h1 className="text-2xl font-bold mb-4">ニックネームを入力してください</h1>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="例：Taro123"
        className="border rounded px-2 py-1 mb-4"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        決定
      </button>
    </form>
  );
}
