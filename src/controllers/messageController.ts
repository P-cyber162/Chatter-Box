import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/AppError.js";

export const sendMessage = async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { text } = req.body;
    if(!userId) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
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

export const updateMessage = async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { messageId } = req.params as { messageId: string };
    const { text } = req.body;
    if(!userId) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
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

export const sendReaction = async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const { messageId } = req.params as { messageId: string };
    const { emoji } = req.body;

    const validEmojis = ['HAPPY', 'FUNNY', 'PARTY', 'LIKE', 'HEAT'];

    if(!userId) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
    };

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

export const getMessages = async(req: AuthenticatedRequest, res: Response) => {
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