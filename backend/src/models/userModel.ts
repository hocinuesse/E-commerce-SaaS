import bcrypt from "bcryptjs";
import { Schema, model, Query } from "mongoose";
import { IUser, UserRole } from "../interfaces/IUser";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [/^[0-9+\s-]{9,15}$/, "Please fill a valid phone number"],
    },
    passwordChangedAt: Date,
    refreshToken: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CLIENT,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      default: null,
    },
    vendorInfo: {
      storeName: {
        type: String,
      },
      commercialRegister: {
        type: String,
        trim: true,
        sparse: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatPassword, this.password || "");
};

userSchema.pre(/^find/, function (this: Query<IUser, IUser>) {
  this.find({ isActive: { $ne: false } });
});

userSchema.pre<IUser>("save", function () {
  if (!this.isModified("password") || this.isNew) return;
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.changedPasswordAfter = function (
  this: IUser,
  JWTTimestamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const userModel = model<IUser>("User", userSchema, "users");

export default userModel;
