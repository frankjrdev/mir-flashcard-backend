import { Response } from 'express';

type ResponseData = {
    success: boolean;
    statusCode: number;
    message: string;
    data?: any;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};

const sendResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data: any = null,
    meta: any = null
) => {
    const response: ResponseData = {
        success,
        statusCode,
        message
    };

    if (data) {
        response.data = data;
    }

    if (meta) {
        response.meta = meta;
    }

    res.status(statusCode).json(response);
};

export default sendResponse;