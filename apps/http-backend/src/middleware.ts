import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common";


export function middleware(req: Request, res: Response, next: NextFunction) {
    try {
        const header = req.headers["authorization"] ?? "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : header;
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded) {
            //@ts-ignore
            req.userId = decoded.userId
            next();
        } else {
            res.status(403).json({
                message: "Unauthorized or token invalid"
            })
        }
    } catch (e) {
        res.status(403).json({
            message: "Unauthorized or token invalid"
        })
    }

}