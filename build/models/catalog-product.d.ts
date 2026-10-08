import mongoose, { Document } from "mongoose";
export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}
declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export default Product;
//# sourceMappingURL=catalog-product.d.ts.map