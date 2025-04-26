import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNickname } from './useNickname';

// Socket.IO クライアントを初期化 (アプリ起動時に一度だけ)
const socket: Socket = io('http://localhost:4000', {
  withCredentials: true,
  transports: ['websocket'],
});

type UseSocketHook = (roomId: string) => Socket;

/**
 * カスタムフック: ニックネームセットと roomId の変化に合わせて join/leave を送信
 * @param roomId geohash_量子化方位 の文字列
 */
export const useSocket: UseSocketHook = (roomId) => {
  const nickname = useNickname();

  // 接続時に一度だけニックネームをサーバーに送信
  useEffect(() => {
    if (nickname) {
      socket.emit('set-nickname', nickname);
    }
  }, [nickname]);

  // roomId の変化に合わせて参加／退出を送信
  useEffect(() => {
    if (!roomId) return;
    socket.emit('join-room', roomId);
    return () => {
      socket.emit('leave-room', roomId);
    };
  }, [roomId]);

  return socket;
};
