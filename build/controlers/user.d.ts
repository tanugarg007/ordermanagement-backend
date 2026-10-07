import { Request, Response } from "express";
interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role?: "user" | "admin";
}
interface LoginRequest {
    email: string;
    password: string;
}
interface DeliveryAddressRequest {
    name: string;
    state: string;
    city: string;
    phoneNumber: string;
    pincode: string;
    address: string;
    houseNumber: string;
}
export declare const registerUser: (req: Request<{}, {}, RegisterRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const loginUser: (req: Request<{}, {}, LoginRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteMyAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const saveDeliveryAddress: (req: Request<{}, {}, DeliveryAddressRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAllUsers: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createUser: (req: Request<{}, {}, RegisterRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=user.d.ts.map