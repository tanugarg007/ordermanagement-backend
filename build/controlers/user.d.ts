import { Request, Response } from "express";
interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
}
export declare const createUser: (req: Request<{}, {}, CreateUserRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=user.d.ts.map