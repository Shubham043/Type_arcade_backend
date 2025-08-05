
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authroutes.js";
import typingTestRoutes from "./routes/typingroutes.js";
import redisClient from "./utils/redis.js";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io"; 

const app = express();
const port = 8000;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Socket maps
const waitingUsers = [];
const userReadyStatus = {};
const playerScores = {};
const userSocketMap = {}; // socket.id -> username

// Socket handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_competition", ({ username }) => {
    if (waitingUsers.some((u) => u.username === username)) {
      console.log("User already joined");
      socket.emit("error", "You're already in the queue!");
      return;
    }

    console.log(`User ${username} joined competition`);
    waitingUsers.push({ socket, username });
    userSocketMap[socket.id] = username;

    if (waitingUsers.length >= 2) {
      const player1 = waitingUsers.shift();
      const player2 = waitingUsers.shift();
      const roomName = `room-${player1.socket.id}-${player2.socket.id}`;

      player1.socket.join(roomName);
      player2.socket.join(roomName);

      userReadyStatus[player1.socket.id] = false;
      userReadyStatus[player2.socket.id] = false;

      io.to(roomName).emit("match_found", {
        room: roomName,
        players: [player1.username, player2.username],
      });

      console.log(`Matched ${player1.username} and ${player2.username} in ${roomName}`);
    }
  });

  socket.on("player_ready", () => {
    userReadyStatus[socket.id] = true;

    const roomName = Array.from(socket.rooms).find((r) => r.startsWith("room-"));
    if (!roomName) return;

    const clients = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
    const bothReady = clients.every((id) => userReadyStatus[id]);

    socket.to(roomName).emit("update_ready_status", true);

    if (clients.length === 2 && bothReady) {
      io.to(roomName).emit("start_countdown");
    }
  });

  socket.on("player_score", ({ score }) => {
    playerScores[socket.id] = score;

    const roomName = Array.from(socket.rooms).find((r) => r.startsWith("room-"));
    if (!roomName) return;

    const clients = Array.from(io.sockets.adapter.rooms.get(roomName) || []);
    if (clients.length === 2 && clients.every((id) => playerScores[id] !== undefined)) {
      const [id1, id2] = clients;
      const score1 = playerScores[id1];
      const score2 = playerScores[id2];

      const user1 = userSocketMap[id1];
      const user2 = userSocketMap[id2];

      console.log(`Scores - ${user1}: ${score1}, ${user2}: ${score2}`);

      io.to(id1).emit("opponent_score", { score: score2 });
      io.to(id2).emit("opponent_score", { score: score1 });

      delete playerScores[id1];
      delete playerScores[id2];
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id} (${userSocketMap[socket.id] || "unknown"})`);

    const index = waitingUsers.findIndex((user) => user.socket.id === socket.id);
    if (index !== -1) waitingUsers.splice(index, 1);

    const roomName = Array.from(socket.rooms).find((r) => r.startsWith("room-"));
    if (roomName) {
      socket.to(roomName).emit("player_disconnected");
    }

    delete userReadyStatus[socket.id];
    delete playerScores[socket.id];
    delete userSocketMap[socket.id];
  });
});

// Routes
app.use("/auth", authRoutes);
app.use("/test", typingTestRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to TypeArcade!");
});

// Redis connection (optional)
// redisClient.connect()
//   .then(() => console.log("Connected to Redis successfully!"))
//   .catch((err) => {
//     console.error("Redis connection failed:", err.message);
//     process.exit(1);
//   });

// MongoDB + server startup
connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
