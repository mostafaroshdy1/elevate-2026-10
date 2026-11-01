/**
 * Auth model placeholder.
 *
 * In most cases, auth uses the User model directly.
 * If you need a separate model (e.g., for refresh tokens or sessions),
 * define it here.
 *
 * Example — Refresh Token model (Mongoose):
 *
 * import mongoose, { Schema, type Document } from "mongoose";
 *
 * const refreshTokenSchema = new Schema({
 *   userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
 *   token: { type: String, required: true, unique: true },
 *   expiresAt: { type: Date, required: true },
 * }, { timestamps: true });
 *
 * refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
 *
 * export const RefreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);
 */
