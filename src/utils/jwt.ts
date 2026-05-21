import {createSecretKey} from 'crypto';
import { jwtVerify, SignJWT } from 'jose';

export interface JwtPayload {
    id: string,
    username: string,
};

export const generateAccessToken = (payload: JwtPayload) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const secretKey = createSecretKey(secret!, 'utf-8');

    return new SignJWT(payload as Record<string, any>)
    .setProtectedHeader({ alg: 'HS256'})
    .setIssuedAt()
    .setExpirationTime(process.env.ACCESS_TOKEN_EXPIRES_IN|| '30m')
    .sign(secretKey)
};

export const verifyAccessToken = async(token: string) => {
        const secretKey = createSecretKey(process.env.ACCESS_TOKEN_SECRET!, 'utf-8');
        const { payload } = await jwtVerify(token, secretKey);

        return payload as unknown as JwtPayload
};