import mongoose, { Schema } from 'mongoose';
import {
  IMetadata,
  IPreferences,
  IProfile,
  ISecurity,
  ISocialAccount,
  IUser,
  IUserModel,
  UserRoles,
  UserStatus,
} from './user.interface';
import bcrypt from 'bcrypt';
import { config } from '../../config';
import paginate from '../../common/plugins/paginate';

const profileSchame = new Schema<IProfile>({
  fullName: String,
  phone: String,
  avatar: String,
  address: String,
});

const securitySchema = new Schema<ISecurity>({
  lastPasswordChange: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  mfaEnabled: { type: Boolean, default: false },
  mfaSecret: String,
  backupCodes: [String],
});

const socialAccountSchema = new Schema<ISocialAccount>({
  facebook: {
    id: String,
    token: String,
  },
  google: {
    id: String,
    token: String,
  },
  twitter: {
    id: String,
    token: String,
  },
});

const preferencesSchema = new Schema<IPreferences>({
  loginNotifications: { type: Boolean, default: true },
  notifications: { type: Boolean, default: true },
  twoFactorAuth: { type: Boolean, default: false },
});

const metadataSchema = new Schema<IMetadata>({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: Date,
  ipAddresses: [String],
  userAgent: [String],
});

const userSchema = new Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: UserRoles,
      default: UserRoles.User,
      index: true,
    },
    status: {
      type: String,
      enum: UserStatus,
      default: UserStatus.Active,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
      index: true,
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    banReason: String,
    banExpiresAt: Date,
    profile: profileSchame,
    security: {
      type: securitySchema,
      default: () => ({}),
    },
    socialAccounts: {
      type: socialAccountSchema,
      default: () => ({}),
    },
    metadata: {
      type: metadataSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: {
      createdAt: 'metadata.createdAt',
      updatedAt: 'metadata.updatedAt',
    },
  }
);

// Indexes for performance
userSchema.index({ email: 1, isEmailVerified: 1 });
userSchema.index({ role: 1, isBlocked: 1, isBanned: 1 });
userSchema.index({ 'metadata.createdAt': -1 });

// add pagination plugin
userSchema.plugin(paginate);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
