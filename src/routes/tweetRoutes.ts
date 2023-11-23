import { Request, Response, Router } from "express";
import { User, PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'

const router = Router();
const prisma = new PrismaClient();

type AuthedRequest = Request & { user?: User };

router.post('/', async (req: AuthedRequest, res) => {
    const { content, image } = req.body;

    if (req.user === null) {
        console.log("empty auth user");
        return res.sendStatus(400);
    }
    const user: User = req.user!

    const authorId = user.id!;
    console.log("post create tweet", content, image, authorId)

    try {
        const result = await prisma.tweet.create({
            data: {
                content,
                image,
                authorId: Number(authorId),
            },
        })
        res.status(201).json(result);
    } catch (e) {
        console.log("create tweet error:", e);
        res.status(400).json({ error: "Error creating a tweet" });
    }
});

router.get('/', async (req: AuthedRequest, res) => {
    const { tweetId } = req.body;
    if (req.user === null) {
        console.log("empty auth user");
        return res.sendStatus(400);
    }
    const user: User = req.user!
    if (tweetId != null) {
        const result = await prisma.tweet.findUnique({ where: { id: Number(tweetId) } })
        res.json(result);
    } else if (user != null) {
        const result = await prisma.tweet.findMany({ where: { authorId: user.id } })
        res.json(result);
    } else {
        res.status(400).json({ error: "Error getting tweet" });
    }
});

router.put('/', async (req, res) => {
    const { tweetId, content, imageData } = req.body;
    try {
        const result = await prisma.tweet.update({
            where: { id: Number(tweetId) },
            data: { content, image: imageData }
        })
        res.json(result)
    } catch (e) {
        console.log("updating tweet error:", e);
        res.status(400).json({ error: "Error updating tweet" });
    }

});

router.delete('/', async (req, res) => {
    const { tweetId } = req.body;
    const result = await prisma.tweet.delete({ where: { id: Number(tweetId) } })
    res.json(result);
});

export default router;
