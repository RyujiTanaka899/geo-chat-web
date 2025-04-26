import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();

// —— CORS ミドルウェア ——
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const httpServer = createServer(app);

// ソケットIDとニックネームを紐付け
const nicknames = new Map<string, string>();

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('🌐 a user connected:', socket.id);

  // ニックネーム設定
  socket.on('set-nickname', (nick: string) => {
    nicknames.set(socket.id, nick);
    console.log(`🔖 ${socket.id} is now known as ${nick}`);
  });

  // ルーム参加
  socket.on('join-room', (roomId: string) => {
    const nick = nicknames.get(socket.id) || socket.id.slice(0, 4);
    socket.join(roomId);
    console.log(`🔑 ${nick} (${socket.id}) joined ${roomId}`);
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      nickname: nick,
      timestamp: Date.now()
    });
  });

  // ルーム退出
  socket.on('leave-room', (roomId: string) => {
    const nick = nicknames.get(socket.id) || socket.id.slice(0, 4);
    socket.leave(roomId);
    console.log(`🚪 ${nick} (${socket.id}) left ${roomId}`);
    socket.to(roomId).emit('user-left', {
      userId: socket.id,
      nickname: nick,
      timestamp: Date.now()
    });
  });

  // チャットメッセージ
  socket.on('chat-message', (data: { roomId: string; message: string }) => {
    const nick = nicknames.get(socket.id) || socket.id.slice(0, 4);
    console.log(`💬 ${nick} (${socket.id}) @ ${data.roomId}: ${data.message}`);
    io.to(data.roomId).emit('chat-message', {
      sender: socket.id,
      nickname: nick,
      message: data.message,
      timestamp: Date.now()
    });
  });

  // 切断
  socket.on('disconnect', () => {
    const nick = nicknames.get(socket.id) || socket.id.slice(0, 4);
    console.log(`🔌 ${nick} (${socket.id}) disconnected`);
    nicknames.delete(socket.id);
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.send('OK');
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log('Server listening on ' + PORT);
});
