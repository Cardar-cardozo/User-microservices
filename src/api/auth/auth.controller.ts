import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Response,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard, LocalAuthGuard } from 'src/core/guards/auth.guards';
import { AuthService } from 'src/core/services/auth/auth/auth.service';
import { GetUser } from 'src/decorator/get-user.decorator';
import { User } from 'src/repository/schemas/user.schema';
import { ResponseData, UtiliHelpers } from 'src/shared/classes/helper';
import { RegistrationDTO } from 'src/shared/dtos/user.dto';
import { UserService } from 'src/shared/services/user.service';

@Controller('auth')
export class AuthController {
  constructor(private authSvc: AuthService, private userSvc: UserService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Response() res) {
    const loggedUser = await (<ResponseData>(
      (<unknown>this.authSvc.login(req.user))
    ));
    // updateCustomerLastLogin
    // const customerLastLogin = await (<ResponseData>(
    //   (<unknown>this.authSvc.updateLastLogin(req.user))
    // ));
    // console.log(loggedUser)
    return UtiliHelpers.sendJsonResponse(
      res,
      loggedUser.data,
      loggedUser.message,
      loggedUser.code,
    );
  }

  @Post('register')
  async register(
    @Request() req,
    @Response() res,
    @Body() body: RegistrationDTO,
  ) {
    try {
      const existingUser: User = await this.userSvc.validUser(
        body.email,
        body.userName,
      );
      if (existingUser && existingUser._id) {
        return UtiliHelpers.sendErrorResponse(
          {},
          'User with email or userName already exists',
          HttpStatus.BAD_REQUEST,
          103,
        );
      }
      const regUser = await this.userSvc.createUser(body);

      delete regUser['hash'];
      delete regUser['salt'];
      delete regUser['OTP'];

      return UtiliHelpers.sendJsonResponse(
        res,
        regUser,
        'Successfully registered',
      );
    } catch (error) {
      console.log(error, 'Error Signing Up');
      switch (error.status) {
        case HttpStatus.BAD_REQUEST:
          return UtiliHelpers.sendErrorResponse(
            {},
            error.response?.message,
            error.status,
            error.response?.code,
          );
        default:
          return UtiliHelpers.sendErrorResponse(
            {},
            'Oops! an error occured. Try again.',
            HttpStatus.INTERNAL_SERVER_ERROR,
            500,
          );
      }
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async userByAuth(@Request() req, @Response() res, @GetUser() user: User) {
    try {
      const userProfile = await this.userSvc.findOneUser(user._id);

      return UtiliHelpers.sendJsonResponse(
        res,
        userProfile,
        'Successfully registered',
      );
    } catch (error) {
      console.log(error, 'Error creating profile');
      switch (error.status) {
        case HttpStatus.BAD_REQUEST:
          return UtiliHelpers.sendErrorResponse(
            {},
            error.response?.message,
            error.status,
            error.response?.code,
          );
        default:
          return UtiliHelpers.sendErrorResponse(
            {},
            'Oops! an error occured. Try again.',
            HttpStatus.INTERNAL_SERVER_ERROR,
            500,
          );
      }
    }
  }

  //   @Post('verify-account')
  //   async verifyAccount(
  //     @Request() req,
  //     @Response() res,
  //     @Body() body: VerifyDTO,
  //   ) {
  //     try {
  //       const user = await this.userSvc.validOtp(body.otp);
  //       if (!user) {
  //         return UtiliHelpers.sendErrorResponse(
  //           {},
  //           'Invalid OTP',
  //           HttpStatus.BAD_REQUEST,
  //           103,
  //         );
  //       }

  //       // Set active
  //       user.verified = true;
  //       user.OTP = undefined;
  //       user.OTPExpire = undefined;

  //       await user.save();
  //       return UtiliHelpers.sendJsonResponse(
  //         res,
  //         user,
  //         'Account verified successfully.',
  //       );
  //     } catch (error) {
  //       console.log(error, 'Error Veriying OTP');
  //       switch (error.status) {
  //         case HttpStatus.BAD_REQUEST:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             error.response?.message,
  //             error.status,
  //             error.response?.code,
  //           );
  //         default:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             'Oops! an error occured. Try again.',
  //             HttpStatus.INTERNAL_SERVER_ERROR,
  //             500,
  //           );
  //       }
  //     }
  //   }

  //   @Patch('resend-otp/:email')
  //   async resendOtp(
  //     @Request() req,
  //     @Response() res,
  //     @Param('email') email: string,
  //   ) {
  //     try {
  //       const user = await this.userSvc.validUser(email, email);
  //       if (!user) {
  //         return UtiliHelpers.sendErrorResponse(
  //           {},
  //           'Invalid User',
  //           HttpStatus.BAD_REQUEST,
  //           103,
  //         );
  //       }
  //       user.generateOTP();
  //       await user.save();

  //       await this.mailSvc.sendMail(
  //         email,
  //         'OTP Request',
  //         { otp: user.OTP, userName: user.userName },
  //         'welcome',
  //       );
  //       return UtiliHelpers.sendJsonResponse(res, user, 'OTP sent successfully.');
  //     } catch (error) {
  //       switch (error.status) {
  //         case HttpStatus.BAD_REQUEST:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             error.response?.message,
  //             error.status,
  //             error.response?.code,
  //           );
  //         default:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             'Oops! an error occured. Try again.',
  //             HttpStatus.INTERNAL_SERVER_ERROR,
  //             500,
  //           );
  //       }
  //     }
  //   }

  //   @Patch('request-forgot-password/:email')
  //   async requestForgotPassword(
  //     @Request() req,
  //     @Response() res,
  //     @Param('email') email: string,
  //   ) {
  //     try {
  //       const user = await this.userSvc.validUser(email, email);
  //       if (!user) {
  //         return UtiliHelpers.sendErrorResponse(
  //           {},
  //           'Invalid User',
  //           HttpStatus.BAD_REQUEST,
  //           103,
  //         );
  //       }
  //       const resetToken = user.getResetPasswordToken();
  //       await user.save();

  //       await this.mailSvc.sendMail(
  //         email,
  //         'Password Reset',
  //         {
  //           host: CONFIG.TOURPLAY_URL,
  //           token: resetToken,
  //           userName: user.userName,
  //         },
  //         'reset-password',
  //       );
  //       return UtiliHelpers.sendJsonResponse(
  //         res,
  //         user,
  //         'Reset link sent successfully.',
  //       );
  //     } catch (error) {
  //       switch (error.status) {
  //         case HttpStatus.BAD_REQUEST:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             error.response?.message,
  //             error.status,
  //             error.response?.code,
  //           );
  //         default:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             'Oops! an error occured. Try again.',
  //             HttpStatus.INTERNAL_SERVER_ERROR,
  //             500,
  //           );
  //       }
  //     }
  //   }

  //   @Patch('forgot-password/:token')
  //   async resetPassword(
  //     @Request() req,
  //     @Response() res,
  //     @Param('token') token: string,
  //     @Body() body: PasswordDTO,
  //   ) {
  //     try {
  //       const resetToken = createHash('sha256').update(token).digest('hex');
  //       const user = await this.userSvc.validResetToken(resetToken);
  //       if (!user) {
  //         return UtiliHelpers.sendErrorResponse(
  //           {},
  //           'Invalid token please check email',
  //           HttpStatus.BAD_REQUEST,
  //           103,
  //         );
  //       }

  //       user.setPassword(body.password);
  //       await user.save();

  //       await this.mailSvc.sendMail(
  //         user.email,
  //         'Password Reset Successfully',
  //         {
  //           userName: user.userName,
  //         },
  //         'reset-password-success',
  //       );
  //       return UtiliHelpers.sendJsonResponse(
  //         res,
  //         user,
  //         'Password updated successfully.',
  //       );
  //     } catch (error) {
  //       switch (error.status) {
  //         case HttpStatus.BAD_REQUEST:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             error.response?.message,
  //             error.status,
  //             error.response?.code,
  //           );
  //         default:
  //           return UtiliHelpers.sendErrorResponse(
  //             {},
  //             'Oops! an error occured. Try again.',
  //             HttpStatus.INTERNAL_SERVER_ERROR,
  //             500,
  //           );
  //       }
  //     }
  //   }
}
