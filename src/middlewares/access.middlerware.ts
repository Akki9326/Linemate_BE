import { UnauthorizedException } from '@/exceptions/UnauthotizedException';
import { AppPermission } from '@/models/enums/app-access.enum';
import { UserType } from '@/models/enums/user-types.enum';
import { RequestWithUser } from '@/models/interfaces/auth.interface';
import { RoleService } from '@/services/role.service';
import { NextFunction, Response } from 'express';

export const accessMiddleWare = (access: AppPermission[]) => {
	const accessValidator = async (req: RequestWithUser, res: Response, next: NextFunction) => {
		const userAccess = (await new RoleService().getAccessByRoleIds(req.user, [req.tenantId])) as AppPermission[];
		try {
			if (req.user) {
				if (req.user.userType === UserType.ChiefAdmin) {
					next();
				} else {
					if (userAccess.some(f => access.some(a => a == f))) {
						next();
					} else {
						next(new UnauthorizedException('Not Allowed'));
					}
				}
			} else {
				next(new UnauthorizedException('Unauthorized access'));
			}
		} catch (error) {
			next(new UnauthorizedException('Wrong access info'));
		}
	};

	return accessValidator;
};
