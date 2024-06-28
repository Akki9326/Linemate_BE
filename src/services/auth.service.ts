import { SECRET_KEY } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { LoginDto } from '@/models/dtos/login.dto';
import { UserDto } from '@/models/dtos/user.dto';

import { TokenData } from '@/models/interfaces/auth.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import DB from '@databases';
import { isEmpty } from '@utils/util';
import JWT from 'jsonwebtoken';
import { Op } from 'sequelize';


class AuthService {
  private users = DB.Users;


  constructor() {
  }
  public async findUserByContactInfo(username: string, isActive: boolean) {
    if (!username) {
      throw new BadRequestException('Email or Phone Number must be provided');
    }
     const user= await this.users.findOne({
      where: {
        [Op.and]: [
          { isActive: isActive },
          {
            [Op.or]: [
              { email: username },
              { mobileNumber: username },
            ],
          },
        ],
      },
    });

    return user;
  }
   private createToken(tokenRawData: JwtTokenData): TokenData {
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60 * 60 * 24 * 7;

    return { expiresIn, token: JWT.sign(tokenRawData, secretKey, { expiresIn }) };
  }
  public async login(loginDto: LoginDto) {

    let userDetails = await this.findUserByContactInfo(loginDto.username, true)


    if (!userDetails)
      throw new BadRequestException('Invalid Email Address');

    const token = this.createToken({
      email: userDetails.email,
      username: userDetails.username,
      id: userDetails.id,
      userType: userDetails.userType,
      tenantId: userDetails.tenantId
    });
    return token

  }
}

export default AuthService;
