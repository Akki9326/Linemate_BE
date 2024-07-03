import { userTypeDto } from '@/models/dtos/userType.dto';
import DB from '@databases';
import { RoleService } from './role.service';

class UserTypeServices {
  private users = DB.Users;
  private resetPasswordToken = DB.ResetPasswordToken;
  private roleService: RoleService;


  constructor() {
    this.roleService = new RoleService();
  }
  
  public async add(userType: userTypeDto) {
         const userTypeDetails = await DB.UserType.create({
        type: userType.type,
        roleId: userType.roleId,
      });
      return userTypeDetails.id

  }

}

export default UserTypeServices;
