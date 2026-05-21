import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const sendMessage = async(req: Request, res: Response) => {
    const { userId, text } = req.body;

    if(!userId) {
        throw new AppError('Please provide a user ID', 400, 'USER_ID_REQUIRED');
    };

    if(!text) {
        throw new AppError('Please provide a message', 400, 'BAD_REQUEST');
    };

    const msg = await prisma.message.create({
        data: {
            userId: userId,
            text: text,
        },
    });

    return res.status(201).json({
        status: 'success',
        message: msg,
    });
};

export const updateMessage = async(req: Request, res: Response) => {
    const { userId, text } = req.body;
    const { messageId } = req.params as { messageId: string };

    if(!userId) {
        throw new AppError('Please provide a user ID', 400, 'USER_ID_REQUIRED');
    };

    if(!text) {
        throw new AppError('Please provide a message', 400, 'BAD_REQUEST');
    };

    const message = await prisma.message.findUnique({
        where: {
            id: messageId,
        }
    });

    if(!message) {
        throw new AppError('Please provide valid message Id', 400, 'BAD_REQUEST');
    };

    const msg = await prisma.message.update({
        where: {
            id: messageId,
            userId: userId
        },
        data: {
            text: text,
            editedAt: new Date()
        }
    });

    return res.status(200).json({
        status: 'success',
        message: msg,
    });
};

export const sendReaction = async(req: Request, res: Response) => {
    const { emoji } = req.body;
    const { messageId } = req.params as { messageId: string };

    const validEmojis = ['HAPPY', 'FUNNY', 'PARTY', 'LIKE', 'HEAT'];

    if(!emoji || !validEmojis.includes(emoji)) {
        throw new AppError('Please provide a valid reaction', 400, 'BAD_REQUEST');
    };

    const message = await prisma.message.findUnique({
        where: { id: messageId }
    });

    if(!message) {
        throw new AppError('Please provide valid message Id', 400, 'BAD_REQUEST');
    };

    const reaction = await prisma.reaction.create({
        data: {
            messageId: messageId,
            emoji: emoji,
        },
    });

    return res.status(201).json({
        status: 'success',
        reaction: reaction,  
    });
};

export const getMessages = async(req: Request, res: Response) => {
    const { roomId } = req.params as { roomId: string };

    if(!roomId) {
        throw new AppError('Please provide a room id', 400, 'BAD_REQUEST');
    };

    const messages = await prisma.message.findMany({
        where: {
            user: {
                roomId: roomId
            }
        },
        include: {
            reaction: true,
            user: {
                select: {
                    username: true,
                    id: true
                }
            }
        },
        orderBy: {
            sentAt: 'asc'
        }
    });

    return res.status(200).json({
        status: 'success',
        messages: messages,
    });
};