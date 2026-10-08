import { UserRole } from "../../models/user";
export interface UserSeed {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}
export declare const users: UserSeed[];
//# sourceMappingURL=users.d.ts.map