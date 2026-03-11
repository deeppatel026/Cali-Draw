import { HTTP_BACKEND } from "@/config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${HTTP_BACKEND}/api/v1/rooms/${roomId}`)
    // const messages = res.data.messages;

    // const shapes = messages.map((x: { message: string }) => {
    //     const messageData = JSON.parse(x.message)
    //     return messageData.shape;
    // })
    const room = res.data.room;
    const shapes = (room?.shapes || []).map((x: { data: string }) => {
        try {
            return JSON.parse(x.data);
        } catch {
            return null;
        }
    }).filter(Boolean);
    return shapes;
}