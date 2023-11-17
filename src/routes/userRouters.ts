import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

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
