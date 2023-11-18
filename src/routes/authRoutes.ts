import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

const EXPERATION_MINS = 10;
const AUTH_EXPERATION_DAYS = 10;
const { v4: uuidv4 } = require('uuid');
const JWT_SECRET = "SUPER SECRET"

function generateEmailToken(): string {
    const uuidString = uuidv4();
    return "EMAIL_TOKE" + uuidString;
}

function generateAuthToken(tokenId: number): string {
    const jwtPayload = { tokenId };

    return jwt.sign(jwtPayload, JWT_SECRET, { algorithm: "HS256", noTimestamp: true })
}

// Create a user, if it doesn't exist,
// generate the email token and send it to their email
// Todo remove this creation part.
router.post('/login', async (req, res) => {
    const { email } = req.body;
    console.log("try to login");


    const emailToken = generateEmailToken();
    const expiration = new Date(new Date().getTime() + EXPERATION_MINS * 60 * 1000);
    const createdToken = await prisma.token.create({
        data: {
            type: 1,
            emailToken: emailToken,
            expiration: expiration,
            user: {
                connectOrCreate: {
                    where: {
                        email
                    },
                    create: {
                        email,
                        username: emailToken
                    }
                }
            }
        }
    })

    console.log(createdToken);
    res.json({ emailToken: createdToken });
})

// Validate the emailToken
// Generate a long lived JWT token
router.post('/authenticate', async (req, res) => {
    const { email, emailToken } = req.body;
    console.log("authentication", email, emailToken);

    const dbEmailToken = await prisma.token.findUnique({
        where: {
            emailToken,
        },
        include: {
            user: true
        }
    })

    console.log(dbEmailToken);
    if (!dbEmailToken || !dbEmailToken.valid) {
        return res.sendStatus(401);
    }
    if (dbEmailToken?.user?.email != email) {
        console.log("Error matching user")
        return res.sendStatus(401);
    }

    if (dbEmailToken.expiration < new Date()) {
        console.log("Expired token")
        return res.sendStatus(401);
    }

    const expiration = new Date(new Date().getTime() + AUTH_EXPERATION_DAYS * 24 * 60 * 60 * 1000);
    const apiToken = await prisma.token.create({
        data: {
            type: 2,
            expiration,
            user: {
                connect: {
                    email,
                },
            },
        },
    });

    // Invalidate the email token
    await prisma.token.update({
        where: { id: dbEmailToken.id },
        data: {
            valid: false
        }
    })

    const authToken = generateAuthToken(apiToken.id);


    res.json({ authToken: authToken });

})

export default router;