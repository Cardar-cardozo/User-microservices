import { createHash, pbkdf2Sync, randomBytes } from 'crypto';
import { Document, Schema } from 'mongoose';

export interface JWTPayload {
  fullName: string;
  userName: string;
  userType: string;
  mobile: string;
  email: string;
  timestamp: number;
  exp: number;
  _id: string;
  role: string;
  userTypeId?: string;
}

export interface GenericMatch {
  [key: string]: string | number | Date | any;
}

export enum UserType {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
}

export interface SignupBody {
  email: string;
  userName: string;
  fullName: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface User extends Document {
  [x: string]: any;
  fullName: string;
  userName: string;
  email: string;
  mobile?: string;
  online: boolean;
  verified: boolean;
  lastSeen: Date;
  lastLogin: Date;
  userType: UserType;

  setPassword(password: string): void;
  validPassword(password: string): boolean;
  JWTPayload(role): string;
}

export const UserSchema: Schema<User> = new Schema(
  {
    fullName: {
      type: String,
      index: true,
      get: (v: Schema.Types.String) =>
        String(v).replace(/ /g, '').toLowerCase(),
    },
    userName: {
      type: String,
      index: true,
      get: (v: Schema.Types.String) =>
        String(v).replace(/ /g, '').toLowerCase(),
    },
    email: {
      type: String,
      required: false,
      index: true,
    },
    salt: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    online: Boolean,
    mobile: {
      type: String,
      index: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    verified: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastSeen: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userType: {
      type: String,
      enum: UserType,
      index: true,
    },
    deletedAt: {
      type: Date,
      index: true,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  },
);

UserSchema.index({ email: 1, mobile: 1, deletedAt: 1 }, { unique: true });
UserSchema.index({ lastLocation: '2dsphere' });

UserSchema.methods.validPassword = function (password: string) {
  const hash: string = pbkdf2Sync(
    password,
    this.salt,
    1000,
    64,
    'SHA1',
  ).toString('hex');
  return this.hash === hash;
};

UserSchema.methods.JWTPayload = function (role): JWTPayload {
  const expiry: Date = new Date();
  expiry.setDate(expiry.getDate() + 7); // expire in seven days

  return {
    fullName: this.fullName,
    userName: this.userName,
    userType: this.userType,
    mobile: this.mobile,
    email: this.email,
    timestamp: Date.now(),
    exp: expiry.getTime(),
    _id: this._id,
    role: role,
  };
};

UserSchema.methods.setPassword = function (password: string) {
  this.salt = randomBytes(16).toString('hex');
  this.hash = pbkdf2Sync(password, this.salt, 1000, 64, 'SHA1').toString('hex');
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = randomBytes(20).toString('hex');
  this.resetPasswordToken = createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
