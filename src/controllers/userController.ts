import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const createUser = async(req: Request, res: Response) => {
    const { username } = req.body;

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

    return res.status(201).json({
        status: 'success',
        message: 'User created successfully!',
        user: newUser,
    });
};

export const getUser = async(req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };

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

    return res.status(200).json({
        status: 'success',
        user: existingUser
    });
};