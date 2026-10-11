import { Document } from "mongoose";
import { Schema } from "mongoose";

export enum UserRole {
  CLIENT = "client",
  ADMIN = "admin",
  VENDOR = "vendor",
  MANAGER = "manager",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  passwordChangedAt?: Date;
  refreshToken?: string;
  role: UserRole;
  isActive: boolean;
  shopId?: Schema.Types.ObjectId;

  vendorInfo?: {
    storeName: string;
    commercialRegister?: string;
    isVerified: boolean;
  };

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
}