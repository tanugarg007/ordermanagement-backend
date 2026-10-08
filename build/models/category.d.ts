import mongoose, { Document } from "mongoose";
export interface ICategory extends Document {
    name: string;
    description: string;
}
declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default Category;
//# sourceMappingURL=category.d.ts.map