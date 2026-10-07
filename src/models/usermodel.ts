import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

const deliveryAddressSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    state: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    phoneNumber: { type: String, required: true, match: /^\d{10}$/ },
    pincode: { type: String, required: true, match: /^\d{6}$/ },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    houseNumber: { type: String, required: true, trim: true, maxlength: 80 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser, TUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email",
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 256,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateJWT = function (): string {
  const payload = { id: String(this._id), email: this.email };
  const secret = process.env.JWT_SECRET || "change_me";
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "7d",
  };
  return jwt.sign(payload, secret, options);
};

userSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, any>) => {
    if ("password" in ret) delete ret.password;
    if ("__v" in ret) delete ret.__v;
    return ret;
  },
});

const User = mongoose.model<IUser, TUserModel>("User", userSchema);

export default User;
