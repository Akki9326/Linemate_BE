import DB from '@databases';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@/models/interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { HttpStatusCode } from '@/models/enums/http-status-code.enum';

class UserService {
  public users = DB.Users;

  public async findAllUser(): Promise<User[]> {
    const allUser: User[] = await this.users.findAll();
    return allUser;
  }

  public async findUserById(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: User = await this.users.findByPk(userId);
    if (!findUser) throw new HttpException(HttpStatusCode.CONFLICT, "You're not user");

    return findUser;
  }
}

export default UserService;
