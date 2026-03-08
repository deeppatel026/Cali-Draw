import { Tool } from "@/components/Canvas";
import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";

type Point = { x: number; y: number };

type ShapeBase = { id: string; color: string; strokeWidth: number; seed: number };

export type Shape = ShapeBase & (
    | { type: "rect";     x: number; y: number; width: number; height: number }
    | { type: "circle";   centerX: number; centerY: number; radius: number }
    | { type: "ellipse";  cx: number; cy: number; rx: number; ry: number }
    | { type: "diamond";  x: number; y: number; width: number; height: number }
    | { type: "line";     x1: number; y1: number; x2: number; y2: number }
    | { type: "arrow";    x1: number; y1: number; x2: number; y2: number }
    | { type: "freedraw"; points: Point[] }
);

const HTTP_URL =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_HTTP_BACKEND_URL) ||
    "http://localhost:3001";

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private rc: RoughCanvas;
    private shapes: Shape[] = [];
    private roomId: string;
    private token: string;
    socket: WebSocket;

    private isDown = false;
    private startX = 0;
    private startY = 0;

    private selectedTool: Tool = "rect";
    private color = "#1e1e1e";
    private strokeWidth = 2;
    private eraserRadius = 20;

    private currentPoints: Point[] = [];
    private erasedIds: Set<string> = new Set();

    // Pan / zoom
    private panX = 0;
    private panY = 0;
    private scale = 1;
    private isPanning = false;
    private lastPanX = 0;
    private lastPanY = 0;

    // Expose zoom for UI
    onZoomChange?: (scale: number) => void;

    constructor(
        canvas: HTMLCanvasElement,
        roomId: string,
        token: string,
        socket: WebSocket,
    ) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.rc = rough.canvas(canvas);
        this.roomId = roomId;
        this.token = token;
        this.socket = socket;
        this.loadShapes();
        this.initSocketHandlers();
        this.initMouseHandlers();
        this.initWheelHandler();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.onMouseDown);
        this.canvas.removeEventListener("mouseup",   this.onMouseUp);
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
        this.canvas.removeEventListener("wheel",     this.onWheel);
    }

    setTool(tool: Tool)        { this.selectedTool = tool; }
    setColor(color: string)    { this.color = color; }
    setStrokeWidth(w: number)  { this.strokeWidth = w; }
    setEraserRadius(r: number) { this.eraserRadius = r; }
    getScale()                 { return this.scale; }

    zoomIn()    { this.setScale(this.scale * 1.15); }
    zoomOut()   { this.setScale(this.scale / 1.15); }
    resetZoom() { this.scale = 1; this.panX = 0; this.panY = 0; this.render(); this.onZoomChange?.(1); }

    private setScale(next: number) {
        this.scale = Math.max(0.1, Math.min(5, next));
        this.render();
        this.onZoomChange?.(this.scale);
    }

    // ─── Loading ──────────────────────────────────────────────────────────────

    private async loadShapes() {
        try {
            const res = await fetch(`${HTTP_URL}/api/v1/rooms/${this.roomId}`, {
                headers: { Authorization: `Bearer ${this.token}` },
            });
            if (res.ok) {
                const data = await res.json();
                // Each DB row has a `data` field containing the JSON-encoded shape
                const rows = (data.room?.shapes ?? []) as { data: string }[];
                this.shapes = rows.map(row => {
                    const s = JSON.parse(row.data) as Shape;
                    return { ...s, seed: s.seed ?? seedFromId(s.id) };
                });
            }
        } catch { /* start with empty canvas */ }
        this.render();
    }

    // ─── HTTP persistence ─────────────────────────────────────────────────────

    private persistShape(shape: Shape) {
        fetch(`${HTTP_URL}/api/v1/rooms/${this.roomId}/shapes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({ shape }),
        }).catch(() => { /* non-fatal */ });
    }

    private persistDelete(ids: string[]) {
        if (ids.length === 0) return;
        fetch(`${HTTP_URL}/api/v1/rooms/${this.roomId}/shapes`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({ ids }),
        }).catch(() => { /* non-fatal */ });
    }

    // ─── WebSocket ────────────────────────────────────────────────────────────

    private initSocketHandlers() {
        this.socket.onmessage = (event) => {
            const msg = JSON.parse(event.data as string);
            if (msg.type === "shape:add") {
                const s = msg.shape as Shape;
                this.shapes.push({ ...s, seed: s.seed ?? seedFromId(s.id) });
                this.render();
            } else if (msg.type === "shapes:batch-delete") {
                const ids = new Set<string>(msg.ids as string[]);
                this.shapes = this.shapes.filter(s => !ids.has(s.id));
                this.render();
            }
        };
    }

    // ─── Rendering ────────────────────────────────────────────────────────────

    private render(preview?: Shape) {
        const { ctx, canvas } = this;
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Dot grid
        this.drawGrid();

        // Apply pan + zoom transform
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.scale, this.scale);

        for (const shape of this.shapes) this.drawShape(shape);
        if (preview) this.drawShape(preview);

        ctx.restore();
    }

    private drawGrid() {
        const { ctx, canvas, panX, panY, scale } = this;
        const spacing = 20 * scale;
        const dotR = 1;

        ctx.fillStyle = "#d1d5db";

        const startX = ((panX % spacing) + spacing) % spacing;
        const startY = ((panY % spacing) + spacing) % spacing;

        for (let x = startX; x < canvas.width; x += spacing) {
            for (let y = startY; y < canvas.height; y += spacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotR, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    private roughOpts(shape: Shape) {
        return {
            stroke: shape.color,
            strokeWidth: shape.strokeWidth,
            roughness: 1.4,
            bowing: 1,
            seed: shape.seed,
        };
    }

    private drawShape(shape: Shape) {
        const ctx = this.ctx;
        const opts = this.roughOpts(shape);

        switch (shape.type) {
            case "rect":
                this.rc.rectangle(shape.x, shape.y, shape.width, shape.height, opts);
                break;

            case "circle":
                this.rc.circle(
                    shape.centerX, shape.centerY,
                    Math.abs(shape.radius) * 2,
                    opts,
                );
                break;

            case "ellipse":
                this.rc.ellipse(
                    shape.cx, shape.cy,
                    Math.abs(shape.rx) * 2, Math.abs(shape.ry) * 2,
                    opts,
                );
                break;

            case "diamond": {
                const { x, y, width, height } = shape;
                this.rc.polygon([
                    [x + width / 2, y],
                    [x + width,     y + height / 2],
                    [x + width / 2, y + height],
                    [x,             y + height / 2],
                ], opts);
                break;
            }

            case "line":
                this.rc.line(shape.x1, shape.y1, shape.x2, shape.y2, opts);
                break;

            case "arrow": {
                this.rc.line(shape.x1, shape.y1, shape.x2, shape.y2, opts);
                const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
                const headLen = 12 + shape.strokeWidth * 2;
                ctx.save();
                ctx.strokeStyle = shape.color;
                ctx.lineWidth   = shape.strokeWidth;
                ctx.lineCap     = "round";
                ctx.beginPath();
                ctx.moveTo(shape.x2, shape.y2);
                ctx.lineTo(
                    shape.x2 - headLen * Math.cos(angle - Math.PI / 6),
                    shape.y2 - headLen * Math.sin(angle - Math.PI / 6),
                );
                ctx.moveTo(shape.x2, shape.y2);
                ctx.lineTo(
                    shape.x2 - headLen * Math.cos(angle + Math.PI / 6),
                    shape.y2 - headLen * Math.sin(angle + Math.PI / 6),
                );
                ctx.stroke();
                ctx.restore();
                break;
            }

            case "freedraw":
                if (shape.points.length < 2) break;
                ctx.save();
                ctx.strokeStyle = shape.color;
                ctx.lineWidth   = shape.strokeWidth;
                ctx.lineCap     = "round";
                ctx.lineJoin    = "round";
                ctx.beginPath();
                ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for (let i = 1; i < shape.points.length; i++) {
                    ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                ctx.stroke();
                ctx.restore();
                break;
        }
    }

    // ─── Eraser hit detection ─────────────────────────────────────────────────

    private hitTest(shape: Shape, px: number, py: number): boolean {
        const r = this.eraserRadius / this.scale;
        switch (shape.type) {
            case "freedraw":
                return shape.points.some(
                    pt => ptDist(pt.x, pt.y, px, py) <= r + shape.strokeWidth / 2,
                );

            case "line":
            case "arrow":
                return segDist(px, py, shape.x1, shape.y1, shape.x2, shape.y2)
                    <= r + shape.strokeWidth / 2;

            case "rect": {
                const { x, y, width, height } = shape;
                return (
                    segDist(px, py, x,         y,          x + width, y)          <= r ||
                    segDist(px, py, x + width, y,          x + width, y + height) <= r ||
                    segDist(px, py, x + width, y + height, x,         y + height) <= r ||
                    segDist(px, py, x,         y + height, x,         y)          <= r
                );
            }

            case "circle": {
                const d = ptDist(shape.centerX, shape.centerY, px, py);
                return Math.abs(d - Math.abs(shape.radius)) <= r + shape.strokeWidth / 2;
            }

            case "ellipse": {
                const nx = (px - shape.cx) / (Math.abs(shape.rx) || 1);
                const ny = (py - shape.cy) / (Math.abs(shape.ry) || 1);
                const d  = Math.sqrt(nx * nx + ny * ny);
                return (
                    Math.abs(d - 1) * Math.min(Math.abs(shape.rx), Math.abs(shape.ry))
                    <= r + shape.strokeWidth / 2
                );
            }

            case "diamond": {
                const { x, y, width, height } = shape;
                const top    = { x: x + width / 2, y };
                const right  = { x: x + width,     y: y + height / 2 };
                const bottom = { x: x + width / 2, y: y + height };
                const left   = { x,                y: y + height / 2 };
                return (
                    segDist(px, py, top.x,    top.y,    right.x,  right.y)  <= r ||
                    segDist(px, py, right.x,  right.y,  bottom.x, bottom.y) <= r ||
                    segDist(px, py, bottom.x, bottom.y, left.x,   left.y)   <= r ||
                    segDist(px, py, left.x,   left.y,   top.x,    top.y)    <= r
                );
            }
        }
    }

    // ─── Coordinate helpers ───────────────────────────────────────────────────

    private toCanvas(clientX: number, clientY: number): Point {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left - this.panX) / this.scale,
            y: (clientY - rect.top  - this.panY) / this.scale,
        };
    }

    // ─── Mouse handlers ───────────────────────────────────────────────────────

    private onMouseDown = (e: MouseEvent) => {
        if (this.selectedTool === "hand") {
            this.isPanning = true;
            this.lastPanX  = e.clientX;
            this.lastPanY  = e.clientY;
            this.canvas.style.cursor = "grabbing";
            return;
        }

        this.isDown = true;
        const { x, y } = this.toCanvas(e.clientX, e.clientY);
        this.startX = x;
        this.startY = y;

        if (this.selectedTool === "freedraw") {
            this.currentPoints = [{ x, y }];
        }
        if (this.selectedTool === "eraser") {
            this.erasedIds = new Set();
            this.eraseAt(x, y);
        }
    };

    private onMouseMove = (e: MouseEvent) => {
        if (this.isPanning) {
            this.panX += e.clientX - this.lastPanX;
            this.panY += e.clientY - this.lastPanY;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.render();
            return;
        }

        const { x, y } = this.toCanvas(e.clientX, e.clientY);

        if (this.selectedTool === "eraser") {
            this.render();
            this.drawEraserCursor(e.clientX, e.clientY);
            if (this.isDown) this.eraseAt(x, y);
            return;
        }

        if (!this.isDown) return;

        if (this.selectedTool === "freedraw") {
            this.currentPoints.push({ x, y });
            this.render({
                id: "__preview__",
                type: "freedraw",
                points: [...this.currentPoints],
                color: this.color,
                strokeWidth: this.strokeWidth,
                seed: 0,
            });
            return;
        }

        const preview = this.buildShape(
            "__preview__",
            x - this.startX,
            y - this.startY,
            0,
        );
        if (preview) this.render(preview);
    };

    private onMouseUp = (e: MouseEvent) => {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = "grab";
            return;
        }

        if (!this.isDown) return;
        this.isDown = false;

        if (this.selectedTool === "eraser") {
            if (this.erasedIds.size > 0) {
                const ids = [...this.erasedIds];
                this.socket.send(JSON.stringify({
                    type: "shapes:batch-delete",
                    ids,
                    roomId: this.roomId,
                }));
                this.persistDelete(ids);
            }
            this.erasedIds = new Set();
            return;
        }

        const { x, y } = this.toCanvas(e.clientX, e.clientY);
        let shape: Shape | null = null;
        const seed = Math.floor(Math.random() * 2 ** 31);

        if (this.selectedTool === "freedraw") {
            if (this.currentPoints.length < 2) { this.currentPoints = []; return; }
            shape = {
                id: crypto.randomUUID(),
                type: "freedraw",
                points: [...this.currentPoints],
                color: this.color,
                strokeWidth: this.strokeWidth,
                seed,
            };
            this.currentPoints = [];
        } else {
            shape = this.buildShape(
                crypto.randomUUID(),
                x - this.startX,
                y - this.startY,
                seed,
            );
        }

        if (!shape) return;

        this.shapes.push(shape);
        this.render();
        this.socket.send(JSON.stringify({
            type: "shape:add",
            shape,
            roomId: this.roomId,
        }));
        this.persistShape(shape);
    };

    private onMouseLeave = () => {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.style.cursor = "grab";
        }
        if (this.selectedTool === "eraser") this.render();
    };

    // ─── Wheel zoom ───────────────────────────────────────────────────────────

    private onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const next = Math.max(0.1, Math.min(5, this.scale * factor));
        this.panX = cx - (cx - this.panX) * (next / this.scale);
        this.panY = cy - (cy - this.panY) * (next / this.scale);
        this.scale = next;
        this.render();
        this.onZoomChange?.(this.scale);
    };

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private buildShape(id: string, dx: number, dy: number, seed: number): Shape | null {
        const { startX: x1, startY: y1, color, strokeWidth, selectedTool } = this;
        const x2 = x1 + dx;
        const y2 = y1 + dy;
        const base = { id, color, strokeWidth, seed };

        switch (selectedTool) {
            case "rect":
                return { ...base, type: "rect", x: x1, y: y1, width: dx, height: dy };
            case "circle":
                return {
                    ...base, type: "circle",
                    centerX: x1 + dx / 2, centerY: y1 + dy / 2,
                    radius: Math.sqrt(dx * dx + dy * dy) / 2,
                };
            case "ellipse":
                return {
                    ...base, type: "ellipse",
                    cx: x1 + dx / 2, cy: y1 + dy / 2,
                    rx: Math.abs(dx) / 2, ry: Math.abs(dy) / 2,
                };
            case "diamond":
                return { ...base, type: "diamond", x: x1, y: y1, width: dx, height: dy };
            case "line":
                return { ...base, type: "line", x1, y1, x2, y2 };
            case "arrow":
                return { ...base, type: "arrow", x1, y1, x2, y2 };
            default:
                return null;
        }
    }

    private eraseAt(px: number, py: number) {
        const next: Shape[] = [];
        for (const shape of this.shapes) {
            if (this.hitTest(shape, px, py)) {
                this.erasedIds.add(shape.id);
            } else {
                next.push(shape);
            }
        }
        if (next.length !== this.shapes.length) {
            this.shapes = next;
            this.render();
            this.drawEraserCursor(
                px * this.scale + this.panX,
                py * this.scale + this.panY,
            );
        }
    }

    private drawEraserCursor(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect();
        const cx = clientX - rect.left;
        const cy = clientY - rect.top;
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.fillStyle   = "rgba(255,255,255,0.6)";
        ctx.lineWidth   = 1.5;
        ctx.arc(cx, cy, this.eraserRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    private initMouseHandlers() {
        this.canvas.addEventListener("mousedown",  this.onMouseDown);
        this.canvas.addEventListener("mouseup",    this.onMouseUp);
        this.canvas.addEventListener("mousemove",  this.onMouseMove);
        this.canvas.addEventListener("mouseleave", this.onMouseLeave);
    }

    private initWheelHandler() {
        this.canvas.addEventListener("wheel", this.onWheel, { passive: false });
    }
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function ptDist(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function segDist(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
    const dx = x2 - x1, dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return ptDist(px, py, x1, y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return ptDist(px, py, x1 + t * dx, y1 + t * dy);
}

function seedFromId(id: string): number {
    let h = 0;
    for (let i = 0; i < id.length; i++) {
        h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}
