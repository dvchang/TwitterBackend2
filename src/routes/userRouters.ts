import { Request, Response, Router } from "express";
import { PrismaClient, User } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

type AuthedRequest = Request & { user?: User };

router.post('/', async (req, res) => {
    const { email, name, username } = req.body;
    console.log("post create user", email, name, username)

    try {
        const result = await prisma.user.create({
            data: {
                email,
                name,
                username,
                bio: "Hello, I'm new on Twitter",
            },
        })
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ error: "Error creating record" });
    }
});

router.post('/follow', async (req: AuthedRequest, res) => {
    const { followerId } = req.body;
    const user: User = req.user!
    console.log("post follow with followerId and followeeId", followerId, user.id)
    if (!followerId) {
        console.log("post follow missing followerId")
        return res.status(400).json({ error: "Error follow user" });
    }

    try {
        const result = await prisma.connection.findMany({
            where: {
                followerId: Number(followerId),
                followeeId: user.id
            }
        })
        if (result.length >= 1) {
            res.status(201).json(result[0]);
        } else {
            try {
                await prisma.connection.create({
                    data: {
                        followerId: Number(followerId),
                        followeeId: user.id
                    }
                })
                res.status(201).json(result);
            } catch (e) {
                console.log("post follow failed to create follow")
                res.status(400).json({ error: "Error creating record" });
            }

        }
    } catch (e) {
        res.status(400).json({ error: "Error creating record" });
    }
});

router.post('/unfollow', async (req: AuthedRequest, res) => {
    const { followerId } = req.body;
    const user: User = req.user!
    console.log("post unfollow with followerId and followeeId", followerId, user.id)

    try {
        const result = await prisma.connection.deleteMany({
            where: {
                followerId: Number(followerId),
                followeeId: user.id
            }
        })
        res.status(201).json(result);
    } catch (e) {
        res.status(400).json({ error: "Error deleting record" });
    }
});

router.get('/', async (req, res) => {
    const allUser = await prisma.user.findMany();
    res.json(allUser)
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { bio, name, image } = req.body;
    try {
        const result = await prisma.user.update({
            where: { id: Number(id) },
            data: { bio, name, image }
        })
        res.json(result)
    } catch (e) {
        res.status(400).json({ error: "Error updating user" });
    }
});


router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: Number(id) } })
    res.json(user)
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } })
    res.send(200);
});

export default router;
