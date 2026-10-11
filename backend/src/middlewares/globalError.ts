import { Request, Response, NextFunction } from 'express';

const globalError = (error : any , req : Request, res : Response, next : NextFunction)=> {
    res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        message : error.message || 'Internal Server Error',
        statusCode : error.statusCode || 500,
        stack: error.stack,
    })
}

export default globalError;
