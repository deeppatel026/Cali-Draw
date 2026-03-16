"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Game } from "@/draw/Game";

export type Tool =
    | "hand"
    | "rect" | "circle" | "ellipse" | "diamond"
    | "line" | "arrow" | "freedraw" | "eraser";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080";

// ─── SVG tool icons ────────────────────────────────────────────────────────────

function IconHand() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2" /><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2" />
            <path d="M10 10.5a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1.5" /><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
    );
}
function IconRect() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
        </svg>
    );
}
function IconDiamond() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
    );
}
function IconCircle() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="9" />
        </svg>
    );
}
function IconEllipse() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <ellipse cx="12" cy="12" rx="10" ry="6" />
        </svg>
    );
}
function IconArrow() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="19" x2="19" y2="5" /><polyline points="9,5 19,5 19,15" />
        </svg>
    );
}
function IconLine() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="5" y1="19" x2="19" y2="5" />
        </svg>
    );
}
function IconPencil() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
    );
}
function IconEraser() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
            <path d="M22 21H7" /><path d="m5 11 9 9" />
        </svg>
    );
}

const TOOLS: { id: Tool; icon: React.ReactNode; label: string; key: string }[] = [
    { id: "hand",     icon: <IconHand />,    label: "Hand",      key: "H" },
    { id: "rect",     icon: <IconRect />,    label: "Rectangle", key: "R" },
    { id: "diamond",  icon: <IconDiamond />, label: "Diamond",   key: "D" },
    { id: "circle",   icon: <IconCircle />,  label: "Circle",    key: "C" },
    { id: "ellipse",  icon: <IconEllipse />, label: "Ellipse",   key: "O" },
    { id: "arrow",    icon: <IconArrow />,   label: "Arrow",     key: "A" },
    { id: "line",     icon: <IconLine />,    label: "Line",      key: "L" },
    { id: "freedraw", icon: <IconPencil />,  label: "Pen",       key: "P" },
    { id: "eraser",   icon: <IconEraser />,  label: "Eraser",    key: "E" },
];

const COLORS = [
    { label: "Black",  value: "#1e1e1e" },
    { label: "Red",    value: "#e03131" },
    { label: "Green",  value: "#2f9e44" },
    { label: "Blue",   value: "#1971c2" },
    { label: "Yellow", value: "#e67700" },
    { label: "Purple", value: "#7048e8" },
    { label: "Pink",   value: "#c2255c" },
];

const STROKE_WIDTHS = [1, 2, 4, 8];

// ─── Canvas ───────────────────────────────────────────────────────────────────

export function Canvas({ roomId, token }: {
    roomId: string;
    token: string;
    userId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef   = useRef<Game | null>(null);

    const [selectedTool,  setSelectedTool]  = useState<Tool>("rect");
    const [color,         setColor]         = useState("#1e1e1e");
    const [strokeWidth,   setStrokeWidth]   = useState(2);
    const [eraserRadius,  setEraserRadius]  = useState(20);
    const [zoomPct,       setZoomPct]       = useState(100);

    // Sync settings to game without re-creating it
    useEffect(() => { gameRef.current?.setTool(selectedTool); }, [selectedTool]);
    useEffect(() => { gameRef.current?.setColor(color); }, [color]);
    useEffect(() => { gameRef.current?.setStrokeWidth(strokeWidth); }, [strokeWidth]);
    useEffect(() => { gameRef.current?.setEraserRadius(eraserRadius); }, [eraserRadius]);

    // Create game + socket once per roomId/token
    useEffect(() => {
        const socket = new WebSocket(`${WS_URL}?token=${token}&roomId=${roomId}`);

        socket.onopen = () => {
            if (!canvasRef.current) return;
            const g = new Game(canvasRef.current, roomId, token, socket);
            g.setTool(selectedTool);
            g.setColor(color);
            g.setStrokeWidth(strokeWidth);
            g.setEraserRadius(eraserRadius);
            g.onZoomChange = (s) => setZoomPct(Math.round(s * 100));
            gameRef.current = g;
        };

        return () => {
            gameRef.current?.destroy();
            gameRef.current = null;
            socket.close();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, token]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const key = e.key.toUpperCase();
            const match = TOOLS.find(t => t.key === key);
            if (match) setSelectedTool(match.id);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const handleZoomIn    = useCallback(() => { gameRef.current?.zoomIn(); }, []);
    const handleZoomOut   = useCallback(() => { gameRef.current?.zoomOut(); }, []);
    const handleResetZoom = useCallback(() => { gameRef.current?.resetZoom(); setZoomPct(100); }, []);

    // Cursor for hand tool
    const cursor = selectedTool === "hand" ? "grab" : "crosshair";

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-white">
            <canvas
                ref={canvasRef}
                width={typeof window !== "undefined" ? window.innerWidth : 1920}
                height={typeof window !== "undefined" ? window.innerHeight : 1080}
                className="absolute inset-0"
                style={{ cursor }}
            />

            {/* ── Left toolbar ── */}
            <Toolbar
                selectedTool={selectedTool}   onToolChange={setSelectedTool}
                color={color}                 onColorChange={setColor}
                strokeWidth={strokeWidth}     onStrokeWidthChange={setStrokeWidth}
                eraserRadius={eraserRadius}   onEraserRadiusChange={setEraserRadius}
            />

            {/* ── Bottom bar ── */}
            <BottomBar
                zoomPct={zoomPct}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
            />

            {/* ── Top-right ── */}
            <TopRight />
        </div>
    );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
    selectedTool:        Tool;
    onToolChange:        (t: Tool) => void;
    color:               string;
    onColorChange:       (c: string) => void;
    strokeWidth:         number;
    onStrokeWidthChange: (w: number) => void;
    eraserRadius:        number;
    onEraserRadiusChange:(r: number) => void;
}

function Toolbar({
    selectedTool, onToolChange,
    color, onColorChange,
    strokeWidth, onStrokeWidthChange,
    eraserRadius, onEraserRadiusChange,
}: ToolbarProps) {
    return (
        <>
            {/* ── Left vertical tool bar ── */}
            <div className="fixed left-3 top-1/2 -translate-y-1/2 z-20">
                <div className="flex flex-col items-center gap-0.5 bg-white border border-gray-200 rounded-xl px-1.5 py-2 shadow-lg shadow-black/10">
                    {TOOLS.map((t, i) => (
                        <>
                            {/* Divider before eraser */}
                            {i === TOOLS.length - 1 && (
                                <div key="div" className="w-6 h-px bg-gray-200 my-1" />
                            )}
                            <button
                                key={t.id}
                                title={`${t.label} (${t.key})`}
                                onClick={() => onToolChange(t.id)}
                                className={`
                                    relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors
                                    ${selectedTool === t.id
                                        ? "bg-violet-600 text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    }
                                `}
                            >
                                {t.icon}
                                <span className="absolute bottom-0.5 right-1 text-[7px] font-semibold opacity-40 leading-none">
                                    {t.key}
                                </span>
                            </button>
                        </>
                    ))}
                </div>
            </div>

            {/* ── Bottom-center style bar ── */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg shadow-black/10">
                    {/* Colors */}
                    <div className="flex items-center gap-1.5">
                        {COLORS.map(c => (
                            <button
                                key={c.value}
                                title={c.label}
                                onClick={() => onColorChange(c.value)}
                                className="w-5 h-5 rounded-full transition-transform hover:scale-125 focus:outline-none"
                                style={{
                                    backgroundColor: c.value,
                                    outline: color === c.value ? `2px solid ${c.value}` : "none",
                                    outlineOffset: "2px",
                                    boxShadow: color === c.value ? "0 0 0 1.5px white inset" : "none",
                                }}
                            />
                        ))}
                    </div>

                    <div className="w-px h-5 bg-gray-200" />

                    {/* Stroke widths */}
                    <div className="flex items-center gap-1">
                        {STROKE_WIDTHS.map(w => (
                            <button
                                key={w}
                                title={`${w}px`}
                                onClick={() => onStrokeWidthChange(w)}
                                className={`
                                    w-8 h-7 rounded-md flex items-center justify-center transition-colors
                                    ${strokeWidth === w
                                        ? "bg-violet-100 text-violet-700"
                                        : "text-gray-500 hover:bg-gray-100"
                                    }
                                `}
                            >
                                <div
                                    className="rounded-full bg-current"
                                    style={{ width: Math.min(w * 4, 20), height: w }}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Eraser radius — only when eraser active */}
                    {selectedTool === "eraser" && (
                        <>
                            <div className="w-px h-5 bg-gray-200" />
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 whitespace-nowrap">Size</span>
                                <input
                                    type="range"
                                    min={5} max={80} step={1}
                                    value={eraserRadius}
                                    onChange={e => onEraserRadiusChange(Number(e.target.value))}
                                    className="w-20 accent-violet-600"
                                />
                                <span className="text-xs text-gray-500 w-5 text-right">{eraserRadius}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// ─── Bottom bar ───────────────────────────────────────────────────────────────

function BottomBar({
    zoomPct, onZoomIn, onZoomOut, onResetZoom,
}: {
    zoomPct: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}) {
    return (
        <div className="fixed bottom-4 left-4 z-20 flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1.5 py-1 shadow-lg shadow-black/10">
            <button
                onClick={onZoomOut}
                title="Zoom out"
                className="w-7 h-7 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg font-medium leading-none"
            >
                −
            </button>
            <button
                onClick={onResetZoom}
                title="Reset zoom"
                className="px-2 h-7 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 min-w-[3rem] tabular-nums"
            >
                {zoomPct}%
            </button>
            <button
                onClick={onZoomIn}
                title="Zoom in"
                className="w-7 h-7 rounded-lg text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg font-medium leading-none"
            >
                +
            </button>
        </div>
    );
}

// ─── Top right ────────────────────────────────────────────────────────────────

function TopRight() {
    return (
        <div className="fixed top-3 right-4 z-20 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl shadow-lg shadow-black/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7048e8" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
                <span className="text-sm font-semibold text-gray-800 tracking-tight">Cali-Draw</span>
            </div>
            <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-violet-600/25 transition-colors"
                onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                }}
                title="Copy link to share"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16,6 12,2 8,6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
            </button>
        </div>
    );
}
