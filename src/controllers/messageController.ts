import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/AppError.js";

export const sendMessage = async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const message = req.body;
    if(!userId) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
    };

    if(!message) {
        throw new AppError('Please provide a message', 400, 'BAD_REQUEST');
    };

    const msg = await prisma.message.create({
        data: {
            userId: userId,
            text: message,
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
    const text = req.body;
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
    const emoji = req.body;
    if(!userId) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
    };

    if(!emoji || emoji !== 'HAPPY' || emoji !== 'FUNNY' || emoji !== 'PARTY' || emoji !== 'PARTY' ||emoji !== 'LIKE' || emoji !== 'HEAT') {
        throw new AppError('Please provide a reaction', 400, 'BAD_REQUEST');
    };

    const msg = await prisma.reaction.create({
        data: {
            messageId: messageId,
            emoji: emoji,
        },
    });

    if(!msg) {
        throw new AppError('Please provide valid message Id ', 400, 'BAD_REQUEST');
    };

    return res.status(201).json({
        status: 'success',
        message: msg,  
    });
};