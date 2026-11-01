/**
 * User model placeholder.
 *
 * Replace with your actual ORM/ODM model:
 * - Mongoose: export const UserModel = mongoose.model("User", userSchema);
 * - Prisma: models are defined in schema.prisma
 * - TypeORM: @Entity() export class User { ... }
 *
 * The model layer handles data persistence.
 * Keep it free of business logic — that belongs in the service layer.
 */

// Example with Mongoose:
//
// import mongoose, { Schema, type Document } from "mongoose";
// import type { IUser } from "./user.type.js";
//
// const userSchema = new Schema<IUser>(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true },
//     password: { type: String, required: true, select: false },
//     role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true },
// );
//
// export const UserModel = mongoose.model<IUser & Document>("User", userSchema);
