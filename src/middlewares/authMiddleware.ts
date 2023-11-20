import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { PrismaClient, User } from "@prisma/client";

const JWT_SECRET = "SUPER SECRET"

const prisma = new PrismaClient();

type AuthRequest = Request & { user?: User };

export async function authenticationToken(
    req: AuthRequest,
    res: Response,
    next: NextFunction) {


    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader?.split(" ")[1];
    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const jwtPayload = await jwt.verify(token, JWT_SECRET);
        console.log(jwtPayload);
        interface JwtPayload {
            tokenId: string;
        }

        const id = (jwtPayload as JwtPayload)?.tokenId;
        if (!id || typeof id != 'number') {
            res.sendStatus(401);
        }

        const dbToken = await prisma.token.findUnique({
            where: { id: Number(id) },
            include: { user: true },
        });

        if (!dbToken || !dbToken?.valid) {
            console.log("token not valid id:", dbToken?.id);
            return res.sendStatus(401);
        }

        if (dbToken.expiration < new Date()) {
            console.log("token expired");
            return res.sendStatus(401);
        }
        req.user = dbToken.user;
        console.log("Set user id", req.user?.id);
        next();

    } catch (e) {
        console.log("error parssing auth token", e);
        return res.sendStatus(401);
    }
}