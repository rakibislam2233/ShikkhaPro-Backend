import mongoose, { Model } from 'mongoose';
import { IPaginateOptions, IPaginateResult } from '../../types/paginate';

// Profile interface
export interface IProfile {
  fullName: string;
  phone?: string;
  avatar?: string;
  address?: string;
}

// Security interface
export interface ISecurity {
  lastPasswordChange: Date;
  loginAttempts: number;
  lockUntil: Date | undefined;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes: string[];
}

// Social account interface
export interface ISocialAccount {
  google?: { id: string; email: string };
  facebook?: { id: string; email: string };
  twitter?: { id: string; username: string };
}

// preferences interface
export interface IPreferences {
  notifications: boolean;
  twoFactorAuth: boolean;
  loginNotifications: boolean;
}

// metadata interface
export interface IMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  ipAddresses: string[];
  userAgent: string[];
}

// User interface
export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: UserRoles;
  status: UserStatus;
  isResetPassword: boolean;
  banReason?: string;
  banExpiresAt?: Date;
  profile: IProfile;
  security: ISecurity;
  socialAccounts: ISocialAccount;
  preferences: IPreferences;
  metadata: IMetadata;
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Unverified = 'Unverified',
  Delete = 'Delete',
  Blocked = 'Blocked',
  Banned = 'Banned',
}

export enum UserRoles {
  User = 'User',
  Admin = 'Admin',
  Super_Admin = 'Super_Admin',
}
export interface IUserModel extends Model<IUser> {
  paginate: (
    filter: object,
    options: IPaginateOptions
  ) => Promise<IPaginateResult<IUser>>;
  isExistUserById(id: string): Promise<Partial<IUser> | null>;
  isExistUserByEmail(email: string): Promise<Partial<IUser> | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
}
