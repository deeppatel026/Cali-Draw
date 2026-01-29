import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";

export type tool = "circle" | "rect" | "pencil"

export function Canvas({ roomId, socket }: {
    roomId: string;
    socket: WebSocket
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game>()
    const [selectedTool, setSelectedTool] = useState<tool>("circle")

    useEffect(()=> {
        game?.setTool(selectedTool)
    },[selectedTool, game])

    useEffect(() => {

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket)
            setGame(g);

            return () => {
                g.destroy();
            }
        }

    }, [canvasRef])

    return <div style={{
        height: "100vh",
        overflow: "hidden"
    }}>
        <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight}></canvas>
        <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
}

function Topbar({selectedTool,setSelectedTool}:{
    selectedTool: tool,
    setSelectedTool: (s: tool) => void
}) {
    return <div style={{
        position: "fixed",
        top: 10,
        left: 10
    }}>
        <div className="flex gap-t">
            <IconButton activated={selectedTool === "pencil"} icon={<Pencil />} onClick={() => {
                setSelectedTool("pencil")
            }}></IconButton>
            <IconButton activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} onClick={() => {
                setSelectedTool("rect")
            }}></IconButton>
            <IconButton activated={selectedTool === "circle"} icon={<Circle />} onClick={() => {
                setSelectedTool("circle")
            }}></IconButton>

        </div>

    </div>
}