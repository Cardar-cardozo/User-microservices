import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GenericMatch,
  SignupBody,
  User,
} from 'src/repository/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async createUser(body: SignupBody) {
    const user = new this.userModel(body);
    user.setPassword(body.password);
    // user.generateOTP();
    await user.save();

    return user;
  }

  async updateUser(match: GenericMatch, update: GenericMatch) {
    return this.userModel.findOneAndUpdate(match, update, { new: true });
  }

  async findOneUser(id: string) {
    const user = await this.userModel.findById(id);
    return user;
  }

  validUser(email: string, userName: string): Promise<User | null> {
    return this.userModel
      .findOne({
        $or: [{ email }, { userName }],
        deletedAt: null,
      })
      .exec();
  }

  validOtp(otp: string) {
    return this.userModel
      .findOne({
        OTP: otp,
        OTPExpire: { $gt: Date.now() },
        deletedAt: null,
      })
      .exec();
  }

  validResetToken(token: string) {
    return this.userModel
      .findOne({
        resetPasswordToken: token,
        OTPExpire: { $gt: Date.now() },
        deletedAt: null,
      })
      .exec();
  }
}
