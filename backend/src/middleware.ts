import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from ".";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // When we have to authenticate the user after the user sign in we do it by jwt thereFore
    // we first extract the token from the user 
    const authHeader = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(authHeader, JWT_SECRET)
          // @ts-ignore
        if (decoded.userId) {
            // @ts-ignore
            req.userId = decoded.userId;
            return next();
        } else {
            return res.status(404).json({
                msg: "You are not logged in"
            });
        }


    } catch (error) {
        return res.status(404).json({
            msg: "You are not logged in"
        })
    }
}