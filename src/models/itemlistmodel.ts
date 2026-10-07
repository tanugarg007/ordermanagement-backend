import mongoose, { Schema, Document } from 'mongoose';

interface IItemList extends Document {
  name: string;
  price: number;
  quantity: number;
  category: string;
  status: string;
  image: string;
}

const itemListSchema = new Schema<IItemList>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ItemList = mongoose.model<IItemList>("ItemList", itemListSchema);
export default ItemList;
