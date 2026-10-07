import mongoose, { Document } from 'mongoose';
interface IItemList extends Document {
    name: string;
    price: number;
    quantity: number;
    category: string;
    status: string;
    image: string;
}
declare const ItemList: mongoose.Model<IItemList, {}, {}, {}, mongoose.Document<unknown, {}, IItemList, {}, mongoose.DefaultSchemaOptions> & IItemList & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IItemList>;
export default ItemList;
//# sourceMappingURL=itemlistmodel.d.ts.map