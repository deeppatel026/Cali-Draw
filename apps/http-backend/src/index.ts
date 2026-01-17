import dotenv from "dotenv";
import path from "path"

dotenv.config({ path: path.resolve(process.cwd(), "../../packages/db/.env") });
import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common";
import { middleware } from "./middleware";
import { createUserSchema, signinUserSchema, createRoomSchema } from "@repo/common/zodschema"
import { prismaClient } from "@repo/db"



const app = express()

app.use(express.json())

app.post("/signup", async (req, res) => {

    const parsedData = createUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(302).json({
            message: "Incorrect input or miss on the zod validation"
        })
        return;
    }



    try {
        const userAdd = await prismaClient.user.create({
            data: {
                email: parsedData.data.email,
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.status(201).json({
            message: "Signed up successfully",
            userId: userAdd.id
        })
    } catch (e) {
        console.log("PRISMA ERROR:", e);
        res.status(411).json({
            message: "User already exists or email already registered"
        })
    }

})


app.post("/signin", async (req, res) => {

    const data = signinUserSchema.safeParse(req.body);
    if (!data.success) {
        res.status(302).json({
            message: "Incorrect input or miss on the zod validation"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: data.data.email,
            password: data.data.password
        }
    })

    if (!user) {
        res.status(412).json({
            message: "No user found"
        })
        return;
    }
    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET)

    res.json({
        message: "You have successfully signed up",
        token: token
    })
})


app.post("/create-room", middleware, async (req, res) => {

    const data = createRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.status(302).json({
            message: "Incorrect input or miss on the zod validation"
        })
        return;
    }

    //@ts-ignore
    const userId = req.userId
    try {
        const room = await prismaClient.room.create({
            data: {
                slug: data.data?.name,
                adminId: userId
            }
        })


        res.json({
            message: "room created successfully",
            roomId: room.id
        })
    } catch (e) {
        res.status(411).json({
            message: "Room already exists"
        })
    }
})

app.get("/chats/:roomId", async function (req,res){
    const roomId = Number(req.params.roomId);
    const messages = await prismaClient.chatArchive.findMany({
        where:{
            roomId: roomId
        },
        orderBy:{
            id: "desc"
        },
        take: 50
    })

    res.json({
        messages
    })
})

app.get("/room/:slug", async function (req,res){
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where:{
            slug
        }
    })

    res.json({
        room
    })
})

app.listen(3001, () => {
    console.log("HTTP server started on 3001")
})


