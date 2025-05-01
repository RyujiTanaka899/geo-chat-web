// components/NicknameForm.tsx
import { useState } from 'react';

interface NicknameFormProps {
  /** 現在のニックネーム（初期値） */
  current: string
  /** 決定ボタンを押したときに呼ばれる */
  onSubmit: (name: string) => void
}

export function NicknameForm({ current, onSubmit }: NicknameFormProps) {
  const [input, setInput] = useState(current)  // current を初期値に

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(input.trim())
  }

  return (
    <form onSubmit={handle}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="ニックネームを入力"
        className="…"
      />
      <button type="submit" className="…">
        決定
      </button>
    </form>
  )
}

