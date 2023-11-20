import { Router } from "express";
import { User, PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    const { content, image } = req.body;
    // @ts-ignore
    const user: User = req.user
    // console.log(token);
    // res.sendStatus(200);

    const authorId = user.id;
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

router.get('/', async (req, res) => {
    const { tweetId, userId } = req.body;
    if (tweetId != null) {
        const result = await prisma.tweet.findUnique({ where: { id: Number(tweetId) } })
        res.json(result);
    } else if (userId != null) {
        const result = await prisma.tweet.findMany({ where: { authorId: Number(userId) } })
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
