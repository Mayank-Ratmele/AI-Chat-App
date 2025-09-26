import http from "http";
import app from "./app.js";
import "dotenv/config.js";
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import { generateResult } from "./services/gemini.service.js";

const port = process.env.PORT || 3000;

const server = http.createServer(app);
// const server = require('http').createServer();
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!token) {
            return next(new Error('Authentication error: token required'))
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Authentication error'))
        }

        if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        const project = await projectModel.findById(projectId);
        if (!project) {
            return next(new Error('Project not found'));
        }

        socket.project = project;
        socket.user = decoded;
        next();

    } catch (error) {
        next(error);
    }
})

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();

    console.log('a user connected!');

    socket.join(socket.roomId);
    socket.on('project-message', async data => {
        const message = data.message;
        const aiIsPresent = message.includes('@ai');

        if (aiIsPresent) {
            const prompt = message.replace('@ai', '').trim();

            try {
                const aiResponse = await generateResult(prompt);
                console.log(aiResponse);

                io.to(socket.roomId).emit('project-message', {
                    message: aiResponse,
                    sender: {
                        _id: 'ai',
                        email: 'AI Assistant'
                    }
                });
            } catch (error) {
                console.error('AI generation error:', error);
                io.to(socket.roomId).emit('project-message', {
                    message: 'Sorry, I encountered an error while processing your request.',
                    sender: {
                        _id: 'ai',
                        email: 'AI Assistant'
                    }
                });
            }

            return;
        }
        
        // Broadcast regular message to all other users in the room
        socket.broadcast.to(socket.roomId).emit('project-message', data);
    })
    socket.on('event', data => { /* … */ });
    socket.on('disconnect', () => { 
        console.log('user-disconnected');
        socket.leave(socket.roomId); 
    });
})
// server.listen(3000);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})