import {Request,Response, NextFunction } from "express";

export function apiAuthorize(req: Request, res: Response, next: NextFunction) {

    const header = req.headers;
    const apiKey = header['x-api-key'];

    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({
            code: 1,
            message: "Unauthorized Access"
        });
    }

    next();


}