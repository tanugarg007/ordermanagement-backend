import { UserRole } from "../../models/user";

export interface UserSeed {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export const users: UserSeed[] = [
  {
    name: "SuperAdmin",
    email: "superadmin@gmail.com",
    password: "super@123",
    role: "superadmin",
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin123",
    role: "admin",
  },
  {
    name: "Test Customer",
    email: "customer@example.com",
    password: "User123",
    role: "user",
  },
  {
    name: "Inventory Manager",
    email: "inventory@example.com",
    password: "Inventory123",
    role: "inventory",
  },
];