// frontend/src/hooks/useNickname.ts
import { useState, useEffect } from 'react';

const adjectives = ['Swift', 'Blue', 'Silent', 'Bright', 'Lucky', 'Witty'];
const animals    = ['Fox', 'Otter', 'Hare', 'Falcon', 'Koala', 'Panda'];

export function useNickname(): string {
  const [name, setName] = useState<string>('');
  useEffect(() => {
    const stored = localStorage.getItem('geoChatNickname');
    if (stored) return setName(stored);
    const adj = adjectives[Math.floor(Math.random()*adjectives.length)];
    const ani = animals[Math.floor(Math.random()*animals.length)];
    const nick = `${adj}${ani}${Math.floor(Math.random()*1000)}`;
    localStorage.setItem('geoChatNickname', nick);
    setName(nick);
  }, []);
  return name;
}
