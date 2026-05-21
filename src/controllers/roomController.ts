import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { AppError } from "../utils/AppError.js";

export const createRoom = async(req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    const name = req.body;
    if(!user) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
    };

    if(!name) {
        throw new AppError('Please provide a name for the room!', 401, 'NAME_NOT_FOUND');
    };

    const room = await prisma.room.create({
        data: {
            name: name,
        }
    });

    return res.status(201).json({
        status: 'success',
        room: room,
    });
};

export const joinRoom = async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const roomName = req.body;
    if(!userId) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
    };

    if(!roomName) {
        throw new AppError('Please provide the room name!', 401, 'BAD_REQUEST');
    };

    const room = await prisma.room.findUnique({
        where: {
            name: roomName,
        },
    });

    if(!room) {
        throw new AppError('Room not found!', 404, 'ROOM_NOT_FOUND');
    };

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            roomId: room.id,
            isActive: true,
        }
    });

    return res.status(201).json({
        status: 'success',
        message: 'You have joined a room!'
    });
};

export const leaveRoom = async(req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    const roomName = req.body;
    if(!userId) {
        throw new AppError('User not authenticated!', 401, 'UNAUTHORIZED');
    };

    if(!roomName) {
        throw new AppError('Please provide the room name!', 401, 'BAD_REQUEST');
    };

    const room = await prisma.room.findUnique({
        where: {
            name: roomName,
        },
    });

    if(!room) {
        throw new AppError('Room not found!', 404, 'ROOM_NOT_FOUND');
    };

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            roomId: room.id,
            isActive: false,
        }
    });

    return res.status(201).json({
        status: 'success',
        message: 'You have exited a room!'
    });
};