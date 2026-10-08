import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI must be set before connecting to MongoDB.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};
