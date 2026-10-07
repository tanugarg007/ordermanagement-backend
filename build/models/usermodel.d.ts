import { Document, Model } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    deliveryAddress?: {
        name: string;
        state: string;
        city: string;
        phoneNumber: string;
        pincode: string;
        address: string;
        houseNumber: string;
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateJWT(): string;
}
interface IUserMethods {
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateJWT(): string;
}
type TUserModel = Model<IUser, {}, IUserMethods>;
declare const User: TUserModel;
export default User;
//# sourceMappingURL=usermodel.d.ts.map