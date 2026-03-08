import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prismaClient } from "@repo/db";
import { createUserSchema, signinUserSchema } from "@repo/common/zodschema";
import { JWT_SECRET } from "@repo/backend-common";

const router: Router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = createUserSchema.parse(req.body);

    const existing = await prismaClient.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prismaClient.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Signup failed" });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = signinUserSchema.parse(req.body);

    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Signin failed" });
  }
});

export default router;