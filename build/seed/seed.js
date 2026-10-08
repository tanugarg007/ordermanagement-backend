"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const category_1 = __importDefault(require("../models/category"));
const product_1 = __importDefault(require("../models/product"));
const order_1 = require("../models/order");
const payment_1 = __importDefault(require("../models/payment"));
const user_1 = __importDefault(require("../models/user"));
const categories_1 = require("./data/categories");
const orders_1 = require("./data/orders");
const payments_1 = require("./data/payments");
const products_1 = require("./data/products");
const users_1 = require("./data/users");
const database_1 = require("../config/database");
const seedCollection = async (collectionName, entries, countDocuments, insertMany) => {
    if (entries.length === 0) {
        console.log(`Skipping ${collectionName}: no seed data configured.`);
        return;
    }
    const existingCount = await countDocuments();
    if (existingCount > 0) {
        console.log(`Skipping ${collectionName}: the collection already contains ${existingCount} document(s).`);
        return;
    }
    await insertMany(entries);
    console.log(`Seeded ${entries.length} ${collectionName} document(s).`);
};
const seedUsers = async () => {
    let createdCount = 0;
    console.log("User seed results:");
    for (const userSeed of users_1.users) {
        const userRole = userSeed.role ?? "user";
        const existingUser = await user_1.default.findOne({ email: userSeed.email });
        if (existingUser) {
            if (existingUser.role !== userRole) {
                throw new Error(`Cannot seed ${userSeed.email}: that email already belongs to a ${existingUser.role} account.`);
            }
            console.log(`  EXISTS ${userSeed.email} (${userRole}; left unchanged)`);
            continue;
        }
        await user_1.default.create(userSeed);
        createdCount += 1;
        console.log(`  CREATED ${userSeed.email} (${userRole})`);
    }
    console.log(`User seed complete: ${createdCount} account(s) created, ${users_1.users.length - createdCount} already present.`);
};
const seed = async () => {
    await (0, database_1.connectDatabase)();
    try {
        await seedUsers();
        await seedCollection("categories", categories_1.categories, () => category_1.default.countDocuments(), (entries) => category_1.default.insertMany(entries));
        await seedCollection("products", products_1.products, () => product_1.default.countDocuments(), (entries) => product_1.default.insertMany(entries));
        await seedCollection("orders", orders_1.orders, () => order_1.OrderList.countDocuments(), (entries) => order_1.OrderList.insertMany(entries));
        await seedCollection("payments", payments_1.payments, () => payment_1.default.countDocuments(), (entries) => payment_1.default.insertMany(entries));
    }
    finally {
        await mongoose_1.default.disconnect();
    }
};
seed().catch((error) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
});
//# sourceMappingURL=seed.js.map