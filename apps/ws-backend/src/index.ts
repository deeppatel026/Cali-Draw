import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_SECRET } from '@repo/backend-common'
import dotenv from "dotenv";
import path from "path"
dotenv.config({ path: path.resolve(process.cwd(), "../../packages/db/.env") });
import { prismaClient } from "@repo/db"

const wss = new WebSocketServer({ port: 8080 })

interface User {
    ws: WebSocket,
    rooms: string[],
    userId: string
}
const users: User[] = []

function checkusr(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (typeof decoded == 'string') {
            return null
        }

        if (!decoded || !decoded.userId) {
            return null
        }
        return decoded.userId;
    }
    catch (e) {
        return null
    }
}


wss.on('connection', function connection(ws, request) {

    const url = request.url;
    if (!url) {
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkusr(token);

    if (!userId) {
        ws.close();
        return null
    }
    if (userId == null) {
        wss.close()
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws
    })


    ws.on('message', async function message(data) {
        if (typeof data !== 'string') {
            ws.close();
            return;
        }
        const parsedData = JSON.parse(data as string);
        if (parsedData.type === "join_room") {
            const user = users.find(z => z.ws === ws);
            user?.rooms.push(parsedData.roomId)
        }
        if (parsedData.type === 'leave_room') {
            const user = users.find(x => x.ws === ws)
            if (!user) {
                return;
            }
            user.rooms = user.rooms.filter(x => x === parsedData.room)
        }

        if (parsedData.type === "chat") {
            const roomId = parsedData.roomId;
            const message = parsedData.message;
            
            await prismaClient.chatArchive.create({
                data: {
                    roomId: roomId,
                    message,
                    userId
                }
            })

            users.forEach(user => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId
                    }))
                }
            })
        }
    });

});


