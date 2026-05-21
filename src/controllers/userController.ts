import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { generateAccessToken } from "../utils/jwt.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createUser = async(req: Request, res: Response) => {
    const username = req.body;

    if(!username) {
        throw new AppError('Please provide a username!', 400, 'PROVIDE_USERNAME');
    };

    const existingUser = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    if(existingUser) {
        throw new AppError('A user with this username already exists!', 400, 'PROVIDE_USERNAME');
    };

    const newUser = await prisma.user.create({
        data: {
            username: username
        },
    });

    const accessToken = await generateAccessToken({
        id: newUser.id,
        username: newUser.username,
    });

    return res.status(201).json({
        status: 'success',
        message: 'User created successfully!',
        accessToken: accessToken,
        user: newUser,
    });
};

export const getUser = async(req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params as { userId: string };
    if(!req.user) {
        throw new AppError('User not authentaicated!', 401, 'ANUTHENTICATED');
    };

    if(!userId) {
        throw new AppError('User id is missing!', 400, 'PROVIDE_USERID');
    };

    const existingUser = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if(!existingUser) {
        throw new AppError('User does not exist!', 400, 'USER_NOT_FOUND');
    };

    const accessToken = await generateAccessToken({
        id: existingUser.id,
        username: existingUser.username,
    });

    return res.status(201).json({
        status: 'success',
        accessToken: accessToken,
        user: {
            existingUser
        }
    });
};