"use client"

import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId, token, userId }: {
    roomId: string;
    token: string;
    userId: string;
}) {
    return <Canvas roomId={roomId} token={token} userId={userId} />;
}