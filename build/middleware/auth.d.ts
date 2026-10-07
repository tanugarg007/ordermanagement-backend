import { Request, Response, NextFunction } from "express";
interface AuthPayload {
    id: string;
    email: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
export declare const protect: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const optionalProtect: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default protect;
//# sourceMappingURL=auth.d.ts.map