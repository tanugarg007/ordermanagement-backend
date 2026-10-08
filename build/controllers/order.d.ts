import { Request, Response } from "express";
export declare const createOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getOrders: (req: Request, res: Response) => Promise<void>;
export declare const getMyOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=order.d.ts.map