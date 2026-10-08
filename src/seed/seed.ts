import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/category";
import ItemList from "../models/product";
import { OrderList } from "../models/order";
import Payment from "../models/payment";
import User from "../models/user";
import { categories } from "./data/categories";
import { orders } from "./data/orders";
import { payments } from "./data/payments";
import { products } from "./data/products";
import { users } from "./data/users";
import { connectDatabase } from "../config/database";

const seedCollection = async <T>(
  collectionName: string,
  entries: T[],
  countDocuments: () => Promise<number>,
  insertMany: (documents: T[]) => Promise<unknown>
) => {
  if (entries.length === 0) {
    console.log(`Skipping ${collectionName}: no seed data configured.`);
    return;
  }

  const existingCount = await countDocuments();
  if (existingCount > 0) {
    console.log(
      `Skipping ${collectionName}: the collection already contains ${existingCount} document(s).`
    );
    return;
  }

  await insertMany(entries);
  console.log(`Seeded ${entries.length} ${collectionName} document(s).`);
};

const seedUsers = async () => {
  let createdCount = 0;
  console.log("User seed results:");

  for (const userSeed of users) {
    const userRole = userSeed.role ?? "user";
    const existingUser = await User.findOne({ email: userSeed.email });
    if (existingUser) {
      if (existingUser.role !== userRole) {
        throw new Error(
          `Cannot seed ${userSeed.email}: that email already belongs to a ${existingUser.role} account.`
        );
      }
      console.log(`  EXISTS ${userSeed.email} (${userRole}; left unchanged)`);
      continue;
    }

    await User.create(userSeed);
    createdCount += 1;
    console.log(`  CREATED ${userSeed.email} (${userRole})`);
  }

  console.log(`User seed complete: ${createdCount} account(s) created, ${users.length - createdCount} already present.`);
};

const seed = async () => {
  await connectDatabase();

  try {
    await seedUsers();
    await seedCollection(
      "categories",
      categories,
      () => Category.countDocuments(),
      (entries) => Category.insertMany(entries)
    );
    await seedCollection(
      "products",
      products,
      () => ItemList.countDocuments(),
      (entries) => ItemList.insertMany(entries)
    );
    await seedCollection(
      "orders",
      orders,
      () => OrderList.countDocuments(),
      (entries) => OrderList.insertMany(entries)
    );
    await seedCollection(
      "payments",
      payments,
      () => Payment.countDocuments(),
      (entries) => Payment.insertMany(entries)
    );
  } finally {
    await mongoose.disconnect();
  }
};

seed().catch((error: unknown) => {
  console.error("Database seeding failed:", error);
  process.exitCode = 1;
});
