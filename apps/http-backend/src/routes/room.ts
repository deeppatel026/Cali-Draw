import { Router, Request, Response } from "express";
import { prismaClient } from "@repo/db";
import { createRoomSchema } from "@repo/common/zodschema";

const router: Router = Router();

// GET all rooms for the authenticated user
router.get("/", async (req: Request, res: Response) => {
  try {
    const rooms = await prismaClient.room.findMany({
      where: { adminId: (req as any).userId },
      orderBy: { created_date: "desc" },
    });
    res.json({ rooms });
  } catch {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

// POST create a new room
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name } = createRoomSchema.parse(req.body);
    const room = await prismaClient.room.create({
      data: {
        name,
        slug: `room-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        adminId: (req as any).userId,
      },
    });
    res.status(201).json({ room });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to create room" });
  }
});

// GET room by ID with all saved shapes
router.get("/:roomId", async (req: Request, res: Response) => {
  try {
    const room = await prismaClient.room.findUnique({
      where: { id: parseInt(req.params.roomId!) },
      include: { shapes: { orderBy: { createdAt: "asc" } } },
    });
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.json({ room });
  } catch {
    res.status(500).json({ message: "Failed to fetch room" });
  }
});

// POST save a single shape
router.post("/:roomId/shapes", async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.roomId!);
    const shape = req.body.shape;
    if (!shape || !shape.id || !shape.type) {
      res.status(400).json({ message: "Invalid shape payload" });
      return;
    }
    const saved = await prismaClient.shape.upsert({
      where: { id: shape.id },
      update: { data: JSON.stringify(shape), type: shape.type },
      create: { id: shape.id, type: shape.type, data: JSON.stringify(shape), roomId },
    });
    res.status(201).json({ shape: saved });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to save shape" });
  }
});

// DELETE batch-delete shapes by id array
router.delete("/:roomId/shapes", async (req: Request, res: Response) => {
  try {
    const ids: string[] = req.body.ids ?? [];
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "ids array required" });
      return;
    }
    await prismaClient.shape.deleteMany({
      where: { id: { in: ids }, roomId: parseInt(req.params.roomId!) },
    });
    res.json({ deleted: ids.length });
  } catch {
    res.status(500).json({ message: "Failed to delete shapes" });
  }
});

export default router;
