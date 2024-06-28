import { BadRequestException } from '@/exceptions/BadRequestException';
import { UserDto } from '@/models/dtos/user.dto';

import { User } from '@/models/interfaces/users.interface';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import DB from '@databases';
import { isEmpty } from '@utils/util';
import { Op } from 'sequelize';


class UserService {
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
  public async add(userData: UserDto, createdBy: string = 'System'): Promise<number> {
    if (isEmpty(userData)) throw new BadRequestException('Invalid Request', userData)
    const userDetails = await this.users.findOne({
      where: [
        {
          isActive: true,
          email: userData.email,
        },
        {
          isActive: true,
          mobileNumber: userData.mobileNumber,
        },
      ],
    });
    if (userDetails) {
      throw new BadRequestException(`User with given email or phone number already exists.`);
    }
    userData.password = PasswordHelper.hashPassword(userData.password);
    const createUserData = await this.users.create({ ...userData, createdBy });
    return createUserData.id;
  }
}

export default UserService;
