import { FRONTEND_URL, MAX_CHIEF } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { UserListDto } from '@/models/dtos/user-list.dto';
import { ChangePasswordDto, ImportUserDto, UserActionDto, UserData, UserDto } from '@/models/dtos/user.dto';
import { UserType, getPermissionGroup } from '@/models/enums/user-types.enum';
import { FilterResponse } from '@/models/interfaces/filter.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { User } from '@/models/interfaces/users.interface';
import { TenantVariables } from '@/models/interfaces/variable.interface';
import { AppMessages, RoleMessage, TenantMessage } from '@/utils/helpers/app-message.helper';
import { UserCaching } from '@/utils/helpers/caching-user.helper';
import { findDefaultRole } from '@/utils/helpers/default.role.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { VariableHelper } from '@/utils/helpers/variable.helper';
import { Email } from '@/utils/services/email';
import { EmailSubjects, EmailTemplates } from '@/utils/templates/email-template.transaction';
import DB from '@databases';
import { parseISO } from 'date-fns';
import { Op } from 'sequelize';
import { TenantService } from './tenant.service';
import VariableServices from './variable.service';
import { VariableCategories } from '@/models/enums/variable.enum';
import { FileDestination } from '@/models/enums/file-destination.enum';
import S3Services from '@/utils/services/s3.services';
import 'reflect-metadata';
import { RoleType } from '@/models/enums/role.enum';
import { CohortService } from './cohort.service';

class UserService {
	private users = DB.Users;
	private role = DB.Roles;
	private tenant = DB.Tenant;
	private variableMaster = DB.VariableMaster;
	private variableMatrix = DB.VariableMatrix;
	private tenantService = new TenantService();
	private variableServices = new VariableServices();
	public s3Service = new S3Services();
	private cohortService = new CohortService();

	constructor() {}
	public async sendAccountActivationEmail(userData, temporaryPassword: string, createdUser: JwtTokenData) {
		await Promise.all(
			userData.tenantIds.map(async tenantId => {
				const tenantDetail = await this.tenantService.one(tenantId);
				const emailSubject = await EmailSubjects.accountActivationSubject(tenantDetail.name);
				const emailBody = EmailTemplates.accountActivationEmail(
					tenantDetail.name,
					userData.firstName,
					createdUser.firstName,
					userData.email,
					temporaryPassword,
					FRONTEND_URL,
				);
				await Email.sendEmail(userData.email, emailSubject, emailBody);
			}),
		);
	}
	public async sendChiefAdminAccountActivationEmail(userData, temporaryPassword: string, createdUser: JwtTokenData) {
		const emailSubject = await EmailSubjects.chiefAdminAccountActivationSubject();
		const emailBody = EmailTemplates.chiefAdminAccountActivationEmail(
			userData.firstName,
			createdUser.firstName,
			userData.email,
			temporaryPassword,
			FRONTEND_URL,
		);
		await Email.sendEmail(userData.email, emailSubject, emailBody);
	}
	public async addAdmin(userData: User) {
		let user = await this.users.findOne({
			where: {
				[Op.and]: [
					{ isDeleted: false },
					{
						[Op.or]: [{ email: userData.email }, { mobileNumber: userData.mobileNumber }],
					},
				],
			},
		});
		if (user) {
			throw new BadRequestException(AppMessages.existedUser);
		}
		user = new this.users();
		user.firstName = userData.firstName;
		user.lastName = userData.lastName;
		user.email = userData.email;
		user.mobileNumber = userData.mobileNumber;
		user.isTemporaryPassword = false;
		user.password = PasswordHelper.hashPassword(userData.password);
		user.userType = UserType.ChiefAdmin;
		user.countryCode = userData.countryCode;
		user = await user.save();

		return user.id;
	}
	private async updateUserRole(userOldType: UserType, userData: UserDto, userId: number) {
		if (userOldType !== userData.userType) {
			for (const tenantId of userData.tenantIds) {
				const roles = await this.role.findAll({
					where: { tenantId: tenantId },
				});

				await Promise.all(
					roles.map(async role => {
						const index = role.userIds.indexOf(userId);
						if (index > -1) {
							const remainingUserIds = role.userIds.filter((_, i) => i !== index);

							role.userIds = remainingUserIds;
							await role.save();
						}
					}),
				);

				const targetRoleName = getPermissionGroup(userData.userType);
				if (targetRoleName) {
					const targetRole = await this.role.findOne({
						where: { name: targetRoleName, tenantId: tenantId },
					});

					if (targetRole && !targetRole.userIds.includes(userId)) {
						targetRole.userIds = [...targetRole.userIds, userId];
						await targetRole.save();
					}
				}
			}
		}
	}
	private async findMultipleTenant(tenantIds: number[]) {
		let tenantDetails = [];
		if (tenantIds && tenantIds.length > 0) {
			tenantDetails = await Promise.all(
				tenantIds.map(async tenantId => {
					return await this.tenant.findOne({
						where: {
							id: tenantId,
							isDeleted: false,
							isActive: true,
						},
						attributes: ['id', 'name', 'trademark', 'phoneNumber'],
					});
				}),
			);
		}
		return tenantDetails;
	}
	private async validateTenantVariable(tenantVariables: TenantVariables[]) {
		for (const variable of tenantVariables) {
			const tenantDetails = await this.tenant.findOne({
				where: {
					id: variable.tenantId,
					isDeleted: false,
				},
				attributes: ['name'],
			});
			if (!tenantDetails) {
				throw new BadRequestException(TenantMessage.tenantVariableNotFound);
			}
			const variableMaster = await this.variableMaster.findAll({
				where: { isDeleted: false, tenantId: variable.tenantId, category: VariableCategories.Custom },
			});
			if (!variableMaster.length) {
				return true;
			}
			const userVariablesMap = new Map(variable.variables.map(item => [item.variableId, item.value]));
			const mandatoryVariables = variableMaster.filter(variable => variable.isMandatory);
			const missingMandatoryVariables = mandatoryVariables.filter(mandatoryVariable => {
				const value = userVariablesMap.get(mandatoryVariable.id);
				if (Array.isArray(value)) {
					return value.length === 0 || value.every(item => item.trim() === '');
				} else {
					return value === undefined || value === null || value.trim() === '';
				}
			});
			if (missingMandatoryVariables.length > 0) {
				const missingFieldsNames = missingMandatoryVariables.map(variable => variable.name).join(', ');
				throw new BadRequestException(`Tenant "${tenantDetails.name}" Missing mandatory fields: ${missingFieldsNames}`);
			}
		}
	}
	private async addTenantVariables(tenantVariables: TenantVariables[], userId: number, creatorId: number) {
		tenantVariables.length &&
			tenantVariables.forEach(async tenant => {
				tenant.variables.length &&
					tenant.variables.forEach(async variable => {
						const variableListMatrix = new this.variableMatrix();
						variableListMatrix.tenantId = tenant.tenantId;
						(variableListMatrix.userId = userId), (variableListMatrix.variableId = variable.variableId);
						variableListMatrix.value = variable.value;
						variableListMatrix.createdBy = creatorId;
						await variableListMatrix.save();
					});
			});
	}
	private async updateTenantVariables(tenantVariables: TenantVariables[], userId: number) {
		for (const tenantVar of tenantVariables) {
			for (const variable of tenantVar.variables) {
				let variableListMatrix = await this.variableMatrix.findOne({
					where: {
						tenantId: tenantVar.tenantId,
						userId: userId,
						variableId: variable.variableId,
					},
				});
				if (!variableListMatrix) {
					variableListMatrix = new this.variableMatrix();
					variableListMatrix.tenantId = tenantVar.tenantId;
					variableListMatrix.userId = userId;
					variableListMatrix.variableId = variable.variableId;
				}
				variableListMatrix.value = variable.value;
				variableListMatrix.updatedBy = userId;
				await variableListMatrix.save();
			}
		}
	}
	private async mapUserTypeToRole(userType: UserType, userId: number, tenantIds: number[]) {
		const defaultRoleIds = await findDefaultRole(userType);
		await Promise.all(
			tenantIds.map(async (tenantId: number) => {
				const role = await this.role.findOne({
					where: { tenantId: tenantId, name: defaultRoleIds, isDeleted: false },
				});

				if (!role) {
					throw new BadRequestException(RoleMessage.roleNotFound);
				}
				const updatedUserIds = [...role.userIds, userId];
				role.userIds = updatedUserIds;
				await role.save();
			}),
		);
	}
	public async add(userData: UserDto, createdUser: JwtTokenData) {
		let user = await this.users.findOne({
			where: {	
				[Op.and]: [
					{ isDeleted: false },
					{
						[Op.or]: [{ email: userData.email }, { mobileNumber: userData.mobileNumber }],
					},
				],
			},
		});
		if (user) {
			throw new BadRequestException(AppMessages.existedUser);
		}
		if (userData.userType === UserType.ChiefAdmin) {
			const existingAdmin = await this.users.findAll({
				where: {
					userType: UserType.ChiefAdmin,
					isDeleted: false,
				},
			});
			if (existingAdmin.length > parseInt(MAX_CHIEF)) {
				throw new BadRequestException(AppMessages.maxAdmin);
			}
		} else {
			if (!userData.tenantIds || !userData.tenantIds.length) {
				throw new BadRequestException(TenantMessage.requiredTenant);
			} else {
				const tenantDetails = await this.tenant.findAll({
					where: {
						id: {
							[Op.in]: userData.tenantIds,
						},
						isDeleted: false,
					},
				});
				if (tenantDetails.length !== userData.tenantIds.length) {
					throw new BadRequestException(TenantMessage.tenantNotFound);
				}
			}
			if (userData.tenantVariables && userData.tenantVariables.length) {
				await this.validateTenantVariable(userData.tenantVariables);
			}
		}
		const temporaryPassword = PasswordHelper.generateTemporaryPassword();
		user = new this.users();
		user.firstName = userData.firstName;
		user.lastName = userData.lastName;
		user.email = userData.email;
		user.mobileNumber = userData.mobileNumber;
		user.isTemporaryPassword = true;
		user.createdBy = createdUser.id;
		user.password = PasswordHelper.hashPassword(temporaryPassword);
		user.tenantIds = userData.userType !== UserType.ChiefAdmin ? userData.tenantIds : [];
		user.userType = userData.userType;
		user.countryCode = userData?.countyCode;
		user.employeeId = userData?.employeeId;
		user.profilePhoto = userData?.profilePhoto;
		user = await user.save();
		if (userData.userType !== UserType.ChiefAdmin) {
			this.mapUserTypeToRole(user.dataValues?.userType, user.id, userData.tenantIds);
			this.addTenantVariables(userData.tenantVariables, user.id, createdUser.id);
			this.sendAccountActivationEmail(user, temporaryPassword, createdUser);
		} else {
			this.sendChiefAdminAccountActivationEmail(user, temporaryPassword, createdUser);
		}
		if (user?.profilePhoto) {
			const fileDestination = `${FileDestination.User}/${user.id}`;
			const movedUrl = await this.s3Service.moveFileByUrl(user.profilePhoto, fileDestination);
			await this.users.update(
				{
					profilePhoto: movedUrl,
				},
				{
					where: {
						id: user.id,
					},
				},
			);
		}
		return { id: user.id };
	}
	public async one(userId: number, tenantId: number) {
		const user = await this.users.findOne({
			where: {
				id: userId,
				isDeleted: false,
			},
			attributes: [
				'id',
				'firstName',
				'lastName',
				'email',
				'mobileNumber',
				'tenantIds',
				'isTemporaryPassword',
				'userType',
				'countryCode',
				'employeeId',
				'profilePhoto',
			],
		});
		if (!user) {
			throw new BadRequestException(AppMessages.userNotFound);
		}
		const tenantDetails = await this.findMultipleTenant(user.tenantIds);
		let tenantVariableDetail = [];
		if (tenantId) {
			tenantVariableDetail = await VariableHelper.findTenantVariableDetails(userId, tenantId);
		}
		return { ...user.dataValues, tenantDetails, tenantVariableDetail };
	}
	public async getUserById(userId: number) {
		const user = await this.users.findOne({
			where: {
				id: userId,
				isDeleted: false,
			},
			attributes: [
				'id',
				'firstName',
				'lastName',
				'email',
				'mobileNumber',
				'tenantIds',
				'isTemporaryPassword',
				'userType',
				'countryCode',
				'employeeId',
				'profilePhoto',
			],
		});
		if (!user) {
			throw new BadRequestException(AppMessages.userNotFound);
		}
		return user;
	}
	public async update(userData: UserDto, userId: number, updatedBy: number) {
		const existingUser = await this.users.findOne({
			where: {
				id: { [Op.not]: userId },
				[Op.or]: [{ email: userData.email }, { mobileNumber: userData.mobileNumber }],
				isDeleted: false,
			},
		});

		if (existingUser) {
			throw new BadRequestException(AppMessages.existedUser);
		}
		const user = await this.users.findOne({
			where: {
				id: userId,
				isDeleted: false,
			},
		});
		if (!user) {
			throw new BadRequestException(AppMessages.userNotFound);
		}
		if (!userData.tenantIds || !userData.tenantIds.length) {
			throw new BadRequestException(TenantMessage.requiredTenant);
		}
		const tenantDetails = await this.tenant.findAll({
			where: {
				id: {
					[Op.in]: userData.tenantIds,
				},
				isDeleted: false,
			},
		});
		if (tenantDetails.length !== userData.tenantIds.length) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		if (userData.tenantVariables && userData.tenantVariables.length) {
			await this.validateTenantVariable(userData.tenantVariables);
		}
		const userOldType = user.userType;
		user.firstName = userData.firstName;
		user.lastName = userData.lastName;
		user.email = userData.email;
		user.mobileNumber = userData.mobileNumber;
		user.tenantIds = userData.userType !== UserType.ChiefAdmin ? userData.tenantIds : [];
		user.userType = userData.userType;
		user.countryCode = userData.countyCode;
		user.employeeId = userData.employeeId;
		user.profilePhoto = userData.profilePhoto;
		user.updatedBy = updatedBy;
		await user.save();
		this.updateUserRole(userOldType, userData, user.id);
		if (userData.userType !== UserType.ChiefAdmin) {
			this.updateTenantVariables(userData.tenantVariables, user.id);
		}
		return { id: user.id };
	}
	public async delete(userIds: UserListDto, userId: number) {
		const usersToDelete = await this.users.findAll({
			where: {
				id: {
					[Op.in]: userIds,
				},
				isDeleted: false,
			},
		});
		if (!usersToDelete.length) {
			throw new BadRequestException(AppMessages.userNotFound);
		}
		for (const user of usersToDelete) {
			user.isDeleted = true;
			user.updatedBy = userId;
			await user.save();
		}
		return usersToDelete.map(user => ({ id: user.id }));
	}
	private async getUserIdsFromVariableMatrix(filterCriteria: { variableId: number; value: string }[]) {
		const whereConditions = filterCriteria.map(criteria => {
			const jsonStringValue = JSON.stringify([criteria.value]);
			return {
				variableId: criteria.variableId,
				[Op.or]: [{ value: { [Op.like]: `%${criteria.value}%` } }, { value: { [Op.like]: `%${jsonStringValue}%` } }],
			};
		});
		const matchingRecords = await this.variableMatrix.findAll({
			where: {
				[Op.or]: whereConditions,
			},
			attributes: ['userId'],
		});

		const matchingUserIds = Array.from(new Set(matchingRecords.map(record => record.userId)));

		return matchingUserIds;
	}
	private async mappingDynamicFilter(condition: object, dynamicFilter: FilterResponse[]) {
		const cohortUserIds = [];
		const variableList = dynamicFilter
			.filter(filter => 'variableId' in filter && 'selectedValue' in filter)
			.map(filter => ({
				value: filter.selectedValue,
				variableId: filter.variableId,
			}));
		for (const filter of dynamicFilter) {
			if (filter.filterKey === 'joiningDate') {
				const parsedStartDate = parseISO(String(filter.minValue));
				const parsedEndDate = parseISO(String(filter.maxValue));
				condition['createdAt'] = {
					[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
				};
			}
			if (filter.filterKey === 'cohort') {
				const userIds = await this.cohortService.getUserByCohortId(Number(filter?.selectedValue));
				cohortUserIds.push(...userIds);
			}
		}
		const variableMatrixUserIds = await this.getUserIdsFromVariableMatrix(variableList);
		const combinedUserIds = Array.from(new Set([...cohortUserIds, ...variableMatrixUserIds]));
		condition['id'] = {
			[Op.in]: combinedUserIds,
		};
	}
	public async all(pageModel: UserListDto, tenantId: number) {
		const orderByField = pageModel.sortField || 'id',
			sortDirection = pageModel.sortOrder || 'ASC';
		const condition = {
			isDeleted: false,
			isActive: true,
		};
		const isPaginationEnabled = pageModel.page && pageModel.limit;
		if (pageModel?.search) {
			condition[Op.or] = [
				{ firstName: { [Op.iLike]: `%${pageModel.search}%` } },
				{ lastName: { [Op.iLike]: `%${pageModel.search}%` } },
				{ email: { [Op.iLike]: `%${pageModel.search}%` } },
				{ mobileNumber: { [Op.iLike]: `%${pageModel.search}%` } },
				{ employeeId: { [Op.iLike]: `%${pageModel.search}%` } },
			];
		}
		if (pageModel.filter) {
			condition['isActive'] = pageModel.filter.isActive;
			if (pageModel.filter.dynamicFilter) {
				await this.mappingDynamicFilter(condition, pageModel.filter.dynamicFilter);
			}
		}
		if (tenantId) {
			condition['tenantIds'] = {
				[Op.contains]: [tenantId],
			};
		}
		const userList = await this.users.findAndCountAll({
			where: condition,
			attributes: ['id', 'firstName', 'lastName', 'email', 'userType', 'mobileNumber', 'createdAt', 'tenantIds', 'employeeId', 'profilePhoto'],
			order: [[orderByField, sortDirection]],
			...(isPaginationEnabled && { limit: pageModel.limit, offset: (pageModel.page - 1) * pageModel.limit }), // Apply pagination if enabled
		});
		if (userList.count) {
			const userRows = await Promise.all(
				userList.rows.map(async user => {
					const tenantDetails = await this.findMultipleTenant(user.tenantIds);
					const tenantVariableDetails = tenantId ? await VariableHelper.findTenantVariableDetails(user.id, tenantId) : [];
					return {
						...user.dataValues,
						tenantDetails,
						tenantVariableDetails,
					};
				}),
			);
			userList.rows = userRows;
		}
		return userList;
	}
	public async deActive(userIds: UserActionDto, userId: number) {
		const usersToDeActive = await this.users.findAll({
			where: {
				id: {
					[Op.in]: userIds,
				},
				isDeleted: false,
				isActive: true,
			},
		});
		if (!usersToDeActive.length) {
			throw new BadRequestException(AppMessages.activeUserNotFound);
		}
		for (const user of usersToDeActive) {
			user.isActive = false;
			user.updatedBy = userId;
			await user.save();
		}
		return usersToDeActive.map(user => ({ id: user.id }));
	}
	public async active(userIds: UserActionDto, userId: number) {
		const usersToActive = await this.users.findAll({
			where: {
				id: {
					[Op.in]: userIds,
				},
				isDeleted: false,
				isActive: false,
			},
		});
		if (!usersToActive.length) {
			throw new BadRequestException(AppMessages.deActiveUserNotFound);
		}
		for (const user of usersToActive) {
			user.isActive = true;
			user.updatedBy = userId;
			await user.save();
		}
		return usersToActive.map(user => ({ id: user.id }));
	}
	public async changePassword(changePasswordUsers: ChangePasswordDto, createdBy: JwtTokenData) {
		const usersData = await this.users.findAll({
			where: {
				id: {
					[Op.in]: changePasswordUsers.userIds,
				},
				isDeleted: false,
				isActive: true,
			},
		});
		if (!usersData.length) {
			throw new BadRequestException(AppMessages.userNotFound);
		}
		for (const user of usersData) {
			const temporaryPassword = PasswordHelper.generateTemporaryPassword();
			user.isTemporaryPassword = true;
			user.password = PasswordHelper.hashPassword(temporaryPassword);
			user.save();
			UserCaching.deleteAllSessions(user.email);
			const tenantDetail = await this.tenantService.one(changePasswordUsers.tenantId);
			const emailSubject = await EmailSubjects.accountActivationSubject(tenantDetail.name);
			const emailBody = EmailTemplates.accountActivationEmail(
				tenantDetail.name,
				user.firstName,
				createdBy.firstName,
				user.email,
				temporaryPassword,
				FRONTEND_URL,
			);
			await Email.sendEmail(user.email, emailSubject, emailBody);
		}
		return usersData.map(user => ({ id: user.id }));
	}
	public async downloadUser(tenantId: number) {
		const tenantExists = await this.tenant.findOne({
			where: {
				id: tenantId,
			},
		});

		if (!tenantExists) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}

		const data = await this.users.findAll({
			where: {
				tenantIds: {
					[Op.contains]: [tenantId],
				},
				isDeleted: false,
			},
			raw: true,
		});
		let userData = [];
		if (data.length) {
			userData = data.map(user => {
				return {
					'First Name': user.firstName,
					'Last Name': user.lastName,
					Email: user.email,
					'Mobile Number': user.mobileNumber,
					'User Type': user.userType,
					'Country Code': user.countryCode,
					'Created At': user.createdAt,
				};
			});
		}

		return userData;
	}
	public async importUser(tenantId: number, userData: ImportUserDto[], createdBy: JwtTokenData) {
		const tenantExists = await this.tenant.findOne({
			where: {
				id: tenantId,
			},
		});

		if (!tenantExists) {
			throw new BadRequestException(TenantMessage.tenantNotFound);
		}
		if (userData.length) {
			const emails = userData.map(row => row['email'].toString());
			const mobileNumbers = userData.map(row => row['mobileNumber'].toString());

			const existingUsers = await this.users.findAll({
				where: {
					[Op.or]: [{ email: { [Op.in]: emails } }, { mobileNumber: { [Op.in]: mobileNumbers } }],
				},
				raw: true,
			});

			if (existingUsers.length) {
				const existingEmails = existingUsers.map(user => user.email);
				const existingMobiles = existingUsers.map(user => user.mobileNumber);
				const duplicates = userData.filter(
					row => existingEmails.includes(row['email'].toString()) || existingMobiles.includes(row['mobileNumber'].toString()),
				);
				throw new BadRequestException(`Duplicate entries found: ${JSON.stringify(duplicates)}`);
			}

			// Map rows to user objects
			const modifyUserData = userData.map(row => {
				const plainPassword = PasswordHelper.generateTemporaryPassword();
				const hashedPassword = PasswordHelper.hashPassword(plainPassword);
				const role = row['permissionGroup'].split(',');
				return {
					firstName: row['firstName'],
					lastName: row['lastName'],
					email: row['email'],
					mobileNumber: row['mobileNumber'],
					userType: UserType.User,
					countryCode: row['countyCode'],
					tenantIds: [tenantId],
					password: hashedPassword,
					plainPassword: plainPassword,
					employeeId: row['employeeId'],
					role: role[0],
					tenantVariables: row['tenantVariables'] && row['tenantVariables'].length ? row['tenantVariables'] : [],
				};
			});

			const plainPasswords = modifyUserData.map(user => ({
				email: user['email'],
				password: user['plainPassword'],
			}));

			for (const userEle of modifyUserData) {
				const newUserObj = {
					...userEle,
				};
				delete newUserObj.role;

				const userExists = await this.users.findOne({ where: { email: newUserObj.email, isDeleted: false } });
				if (!userExists) {
					const createUser = await this.users.create(newUserObj);
					const role = await this.role.findOne({ where: { name: userEle.role, tenantId: tenantId } });
					let newUserlist = [];
					if (role) {
						newUserlist = [...role.userIds, createUser.id];
						await this.role.update({ userIds: newUserlist }, { where: { id: role.id } });
					} else {
						newUserlist = [createUser.id];
						await this.role.create({
							name: userEle.role,
							tenantId: tenantId,
							userIds: newUserlist,
							type: RoleType.Custom,
							description: userEle.role,
						});
					}

					if (userEle.tenantVariables && userEle.tenantVariables.length) {
						await this.validateTenantVariable(userEle.tenantVariables);
						this.addTenantVariables(userEle.tenantVariables, createUser.id, createdBy.id);
					}

					const plainPassword = plainPasswords.find(p => p.email === userEle.email).password;
					const emailSubject = await EmailSubjects.accountActivationSubject(tenantExists.name);
					const emailBody = EmailTemplates.accountActivationEmail(
						tenantExists.name,
						userEle.firstName,
						userEle.lastName,
						userEle.email,
						plainPassword,
						FRONTEND_URL,
					);
					await Email.sendEmail(userEle.email, emailSubject, emailBody);
				}
			}
		}
	}
	public async getUserFields(tenantId: number) {
		const getTenantVariable = await this.variableMaster.findAll({
			where: { tenantId: tenantId },
			attributes: ['id', 'name', 'isMandatory', 'type', 'category', 'options'],
		});
		return {
			defaultFields: UserData.fields,
			variableFields: getTenantVariable,
		};
	}
}

export default UserService;
