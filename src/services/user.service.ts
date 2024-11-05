import { FRONTEND_URL, MAX_CHIEF } from '@/config';
import { BadRequestException } from '@/exceptions/BadRequestException';
import { ServerException } from '@/exceptions/ServerException';
import { UserModel } from '@/models/db/users.model';
import { UserListDto } from '@/models/dtos/user-list.dto';
import { ChangePasswordDto, SelectUserData, UserActionDto, UserData, UserDto } from '@/models/dtos/user.dto';
import { FileDestination } from '@/models/enums/file-destination.enum';
import { FilterKey } from '@/models/enums/filter.enum';
import { SortOrder } from '@/models/enums/sort-order.enum';
import { UserStatus, UserType, getPermissionGroup } from '@/models/enums/user-types.enum';
import { VariableCategories, VariableType } from '@/models/enums/variable.enum';
import { FilterResponse } from '@/models/interfaces/filter.interface';
import { JwtTokenData } from '@/models/interfaces/jwt.user.interface';
import { User } from '@/models/interfaces/users.interface';
import { TenantVariables, variableValues } from '@/models/interfaces/variable.interface';
import { AppMessages, RoleMessage, TenantMessage, VariableMessage } from '@/utils/helpers/app-message.helper';
import { UserCaching } from '@/utils/helpers/caching-user.helper';
import { findDefaultRole } from '@/utils/helpers/default.role.helper';
import ExcelService from '@/utils/helpers/error-excel.helper';
import { PasswordHelper } from '@/utils/helpers/password.helper';
import { VariableHelper } from '@/utils/helpers/variable.helper';
import { Email } from '@/utils/services/email';
import S3Services from '@/utils/services/s3.services';
import { EmailSubjects, EmailTemplates } from '@/utils/templates/email-template.transaction';
import DB from '@databases';
import { plainToInstance } from 'class-transformer';
import { ValidationError, isEmail, isNumber, isPhoneNumber, validate } from 'class-validator';
import { parseISO } from 'date-fns';
import 'reflect-metadata';
import { BelongsTo, Op, Sequelize } from 'sequelize';
import { CohortService } from './cohort.service';
import { RoleService } from './role.service';
import { TenantService } from './tenant.service';
import moment from 'moment';

class UserService {
	private users = DB.Users;
	private role = DB.Roles;
	private tenant = DB.Tenant;
	private variableMaster = DB.VariableMaster;
	private variableMatrix = DB.VariableMatrix;
	private tenantService = new TenantService();
	private roleService = new RoleService();
	public s3Service = new S3Services();
	private cohortService = new CohortService();
	private excelService = new ExcelService();

	constructor() { }
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
	private async validateValue(value, type: string, options: string[], variableName: string, tenantName: string) {
		switch (type) {
			case VariableType.Text:
				if (typeof value !== 'string' || value.trim() === '') {
					throw new BadRequestException(`Tenant "${tenantName}" Invalid value for field: ${variableName}`);
				}
				break;
			case VariableType.SingleSelect:
				if (!options.includes(value)) {
					throw new BadRequestException(`Tenant "${tenantName}" select value from given options for field: ${variableName}`);
				}
				break;
			case VariableType.MultiSelect:
				if (!Array.isArray(value) || value.some(v => !options.includes(v))) {
					throw new BadRequestException(`Tenant "${tenantName}" Invalid value for for field: ${variableName}`);
				}
				break;
			case VariableType.Numeric:
				if (!isNumber(value)) {
					throw new BadRequestException(`Tenant "${tenantName}" Invalid value for field: ${variableName}`);
				}
				break;
			case VariableType.Email:
				if (!isEmail(value)) {
					throw new BadRequestException(`Tenant "${tenantName}" Invalid value for field: ${variableName}`);
				}
				break;
			case VariableType.PhoneNumber:
				if (!isPhoneNumber(value)) {
					throw new BadRequestException(`Tenant "${tenantName}" Invalid value for field: ${variableName}`);
				}
				break;
			case VariableType.Date:
				if (!moment(value, moment.ISO_8601, true).isValid()) {
					throw new BadRequestException(`Tenant "${tenantName}" Invalid value for field: ${variableName}`);
				}
				break;
			default:
				break;
		}
	}
	private async validateTenantVariable(tenantVariables: TenantVariables[], tenantId?: number) {
		for (const variable of tenantVariables) {
			const tenantDetails = await this.tenant.findOne({
				where: {
					id: variable.tenantId || tenantId,
					isDeleted: false,
				},
				attributes: ['name'],
			});
			if (!tenantDetails) {
				throw new BadRequestException(TenantMessage.tenantVariableNotFound);
			}
			const variableMaster = await this.variableMaster.findAll({
				where: { isDeleted: false, tenantId: variable.tenantId || tenantId, category: VariableCategories.Custom },
			});
			if (!variableMaster.length) {
				return true;
			}
			const userVariablesMap = new Map(variable.variables.map(item => [item.variableId, item.value]));
			const mandatoryVariables = variableMaster.filter(variable => variable.isMandatory);
			const missingMandatoryVariables = mandatoryVariables.filter(mandatoryVariable => {
				const value = userVariablesMap.get(mandatoryVariable.id);
				if (Array.isArray(value)) {
					return (
						value.length === 0 ||
						value.every(item => {
							if (typeof item === 'string') {
								return item.trim() === '';
							}
							return item === undefined || item === null;
						})
					);
				} else {
					if (typeof value === 'string') {
						return value.trim() === '';
					}
					return value === undefined || value === null;
				}
			});
			if (missingMandatoryVariables.length > 0) {
				const missingFieldsNames = missingMandatoryVariables.map(variable => variable.name).join(', ');
				throw new BadRequestException(`Tenant "${tenantDetails.name}" Missing mandatory fields: ${missingFieldsNames}`);
			}
			for (const variable of variableMaster) {
				const value = userVariablesMap.get(variable.id);
				if (value !== undefined && value !== null) {
					await this.validateValue(value, variable.type, variable.options, variable.name, tenantDetails.name);
				}
			}
		}
	}
	private async validateImportUserVariables(tenantVariables: variableValues[]) {
		let message;
		for (let i = 0; i < tenantVariables.length; i++) {
			const variableElement = tenantVariables[i];
			const variable = await this.variableMaster.findOne({ where: { id: variableElement.variableId } });
			if (!variable) {
				message = VariableMessage.variableNotFound;
				continue;
			}

			if (variable.type === VariableType.Text && variableElement.value == '' && !(typeof variableElement.value == 'string')) {
				message = VariableMessage.textVariableMustString;
				continue;
			}
			function isNumeric(value): boolean {
				return typeof value === 'number' && !isNaN(value);
			}
			if (variable.type === VariableType.Numeric) {
				variableElement.value = +variableElement.value;
				if (!isNumeric(+variableElement.value)) {
					message = VariableMessage.numericVariableMustNumber;
					continue;
				}
			}
			if (variable.type === VariableType.SingleSelect) {
				if (!variable.options.includes(variableElement.value)) {
					message = VariableMessage.singleSelectMustMustBeAnOptions;
					continue;
				}
			}
			if (variable.type === VariableType.MultiSelect) {
				if (variableElement.value) {
					variableElement.value = variableElement.value.split(',');
				}
				for (const value of variableElement.value) {
					if (!variable.options.includes(value)) {
						message = VariableMessage.multiSelectMustMustBeAnOptions;
						continue;
					}
				}
			}

			if (message) return message;
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
		const conditions: { isDeleted: boolean; email?: string; mobileNumber?: string }[] = [];

		if (userData.email) {
			conditions.push({ isDeleted: false, email: userData.email });
		}

		if (userData.mobileNumber) {
			conditions.push({ isDeleted: false, mobileNumber: userData.mobileNumber });
		}

		let user = await this.users.findOne({
			where: {
				[Op.and]: [
					{ isDeleted: false },
					{
						[Op.or]: conditions,
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
		user.role = userData?.role;
		user.joiningDate = userData?.joiningDate;
		user.reportToId = userData?.reportToId;
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
				'reportToId',
				'joiningDate',
				'role',
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
	public async update(userData: UserDto, userId: number, updatedBy: JwtTokenData) {
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

		const temporaryPassword = PasswordHelper.generateTemporaryPassword();
		const userOldType = user.userType;
		user.firstName = userData.firstName;
		user.lastName = userData.lastName;
		user.tenantIds = userData.userType !== UserType.ChiefAdmin ? userData.tenantIds : [];
		user.userType = userData.userType;
		user.countryCode = userData.countyCode;
		user.employeeId = userData.employeeId;
		user.profilePhoto = userData.profilePhoto;
		user.role = userData?.profilePhoto;
		user.joiningDate = userData?.joiningDate;
		user.reportToId = userData?.reportToId;

		if (userData.email || userData.mobileNumber) {
			user.email = userData.email;
			user.mobileNumber = userData.mobileNumber;

			// Send invitaion email
			this.sendAccountActivationEmail(user, temporaryPassword, updatedBy);
		}
		user.updatedBy = updatedBy.id;

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

		const havingClause = filterCriteria.map(criteria =>
			Sequelize.literal(`COUNT(DISTINCT CASE WHEN "variableId" = ${criteria.variableId} AND "value" = '${criteria.value}' THEN 1 END) > 0`),
		);

		const matchingRecords = await this.variableMatrix.findAll({
			where: {
				[Op.or]: whereConditions,
			},
			attributes: ['userId'],
			group: ['userId'],
			having: {
				[Op.and]: havingClause,
			},
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
			if (filter.filterKey === FilterKey.JoiningDate) {
				if (filter.minValue && filter.maxValue) {
					const parsedStartDate = parseISO(String(filter.minValue));
					const parsedEndDate = parseISO(String(filter.maxValue));
					condition['joiningDate'] = {
						[Op.between]: [new Date(parsedStartDate), new Date(parsedEndDate)],
					};
				} else {
					throw new BadRequestException(AppMessages.InvalidFilterDate);
				}
			}

			if (filter.filterKey === FilterKey.Cohort) {
				const userIds = await this.cohortService.getUserByCohortId(Number(filter?.selectedValue));
				cohortUserIds.push(...userIds);
			}

			if (filter.filterKey === FilterKey.UserType) {
				condition['userType'] = filter.selectedValue;
			}

			if (filter.filterKey === FilterKey.AssignedCompanies) {
				const tenents = [];
				const tenant = await this.tenant.findOne({ where: { name: filter.selectedValue } });
				tenents.push(tenant.id);
				const assignedCompanies = await this.users.findAll({
					where: {
						tenantIds: {
							[Op.in]: [tenents],
						},
					},
				});
				condition['tenantIds'] = assignedCompanies[0].tenantIds;
			}

			if (filter.filterKey === FilterKey.UserStatus) {
				filter.selectedValue === UserStatus.Active ? (condition['isActive'] = true) : (condition['isActive'] = false);
			}
		}
		const variableMatrixUserIds = await this.getUserIdsFromVariableMatrix(variableList);

		let combinedUserIds = [];
		if (variableMatrixUserIds.length && cohortUserIds.length) {
			const cohortUserIdsSet = new Set(cohortUserIds);
			combinedUserIds = variableMatrixUserIds.filter(userId => cohortUserIdsSet.has(userId));
		} else {
			if (variableMatrixUserIds.length) {
				combinedUserIds = variableMatrixUserIds;
				if (cohortUserIds.length) {
					combinedUserIds = cohortUserIds;
				}
			} else {
				if (!variableList?.length && cohortUserIds.length) {
					combinedUserIds = cohortUserIds;
				}
			}
		}
		if (variableList.length || cohortUserIds?.length) {
			condition['id'] = {
				[Op.in]: combinedUserIds,
			};
		}
		return condition;
	}
	public async all(pageModel: UserListDto, tenantId: number) {
		const validSortFields = Object.keys(UserModel.rawAttributes);
		const orderByField = validSortFields.includes(pageModel.sortField) ? pageModel.sortField : 'id';
		const sortDirection = Object.values(SortOrder).includes(pageModel.sortOrder as SortOrder) ? pageModel.sortOrder : SortOrder.ASC;
		let condition = {
			isDeleted: false,
			isActive: true,
		};

		if (pageModel.filter) {
			condition['isActive'] = pageModel.filter.isActive ?? true;
			if (pageModel.filter.dynamicFilter && pageModel.filter.dynamicFilter.length) {
				condition = {
					...condition,
					...(await this.mappingDynamicFilter(condition, pageModel.filter.dynamicFilter)),
				};
			}
		}
		if (tenantId) {
			condition['tenantIds'] = {
				[Op.contains]: [tenantId],
			};
		}
		const totalUsersCount = await this.users.count({
			where: condition,
		});
		const userList = await this.users.findAll({
			where: condition,
			attributes: [
				'id',
				'firstName',
				'lastName',
				'email',
				'userType',
				'mobileNumber',
				'createdAt',
				'tenantIds',
				'employeeId',
				'profilePhoto',
				'joiningDate',
				'role',
				'reportToId',
			],
			order: [[orderByField, sortDirection]],
			offset: pageModel.page ? (pageModel.page - 1) * pageModel.limit : undefined,
			limit: pageModel.limit || undefined, // Apply pagination if enabled
			include: [
				{
					association: new BelongsTo(this.users, this.users, { as: 'ReportTo', foreignKey: 'reportToId' }),
					attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
				},
			],
		});

		let searchArray = [];

		if (userList.length) {
			const userRows = await Promise.all(
				userList.map(async user => {
					const tenantDetails = (await this.findMultipleTenant(user.tenantIds)) || [];
					const tenantVariableDetails = tenantId ? await VariableHelper.findTenantVariableDetails(user.id, tenantId) : [];
					return {
						...user.dataValues,
						tenantDetails,
						tenantVariableDetails,
					};
				}),
			);
			searchArray = userRows;
		}

		if (pageModel?.search && pageModel.search.trim() !== '') {
			const regex = new RegExp(pageModel?.search, 'i');
			const filteredRows = searchArray.filter(row => {
				const firstNameMatches = regex.test(row.firstName);
				const lastNameMatches = regex.test(row.lastName);
				const emailMatches = regex.test(row.email);
				const mobileNoMatches = regex.test(row.mobileNumber);
				const employeeIdMatches = row.employeeId ? regex.test(row.employeeId) : false;
				const tenantNameMatches =
					row.tenantDetails && row.tenantDetails.length > 0
						? row.tenantDetails.some(tenant => tenant && tenant.name && regex.test(tenant.name))
						: false;

				// Return true if any of the fields match
				return firstNameMatches || lastNameMatches || emailMatches || mobileNoMatches || employeeIdMatches || tenantNameMatches;
			});

			if (filteredRows && filteredRows.length) {
				return {
					count: totalUsersCount,
					rows: filteredRows,
				};
			}
		}
		return {
			count: totalUsersCount,
			rows: searchArray,
		};
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
			UserCaching.deleteAllSessions(user.email || user.mobileNumber);
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
		if (data.length) {
			const userData = await Promise.all(
				data.map(async user => {
					const tenantVariableDetails = tenantId ? await VariableHelper.findTenantVariableDetails(user.id, tenantId) : [];
					const userDetails = {
						email: user.email,
						firstName: user.firstName,
						lastName: user.lastName,
						id: user.id,
						userType: user.userType,
					} as JwtTokenData;
					const access = await this.roleService.getAccessByRoleIds(userDetails, [tenantId]);

					const returnObj = {
						'First Name': user.firstName,
						'Last Name': user.lastName,
						Email: user.email,
						'Mobile Number': user.mobileNumber,
						'User Type': user.userType,
						'Country Code': user.countryCode,
						'Created At': user.createdAt,
						tenantVariableDetails: tenantVariableDetails,
						permissionGroup: access,
					};

					return returnObj;
				}),
			);
			return userData;
		}
	}
	public async removeMatchingRecords(errorsArray, dataArray) {
		return dataArray.filter(dataItem => {
			const isMatch = errorsArray.some(errorItem => {
				const emailMatch = errorItem.email === dataItem.email;
				const employeeIdMatch = errorItem.employeeId === dataItem.employeeId;

				return emailMatch || employeeIdMatch; // Return true if either email or employeeId match
			});

			// Keep the item if no match is found
			return !isMatch;
		});
	}
	public async importUser(tenantId: number, userData, createdBy: JwtTokenData) {
		try {
			const tenantExists = await this.tenant.findOne({
				where: {
					id: tenantId,
				},
			});

			if (!tenantExists) {
				throw new BadRequestException(TenantMessage.tenantNotFound);
			}
			const errorArray = [];

			const userDataInstances = userData.map(user => plainToInstance(UserData, user));

			for (const userInstance of userDataInstances) {
				const validationErrors = await validate(userInstance, {
					skipMissingProperties: false, // This ensures that missing properties will be flagged as errors
					whitelist: true,
					forbidNonWhitelisted: false,
				});

				if (validationErrors.length > 0) {
					// Collect the error message for each validation error
					let message = '';
					validationErrors.forEach((error: ValidationError) => {
						if (error.constraints) {
							// Combine error messages
							message += Object.values(error.constraints).join(', ') + '. ';
						}
					});

					// Push the relevant fields and error message into the errorArray
					errorArray.push({
						firstName: userInstance.firstName,
						lastName: userInstance.lastName,
						email: userInstance.email,
						employeeId: userInstance.employeeId,
						errorReason: message.trim(), // Remove extra spaces
					});
				}
				if (userInstance.reportTo) {
					const managerDetails = await this.users.findOne({
						where: {
							email: userInstance.reportTo,
							tenantIds: {
								[Op.contains]: [tenantId],
							},
						},
						attributes: ['id', 'email', 'tenantIds'],
					});

					userInstance.reportToId = managerDetails?.id;
				}
			}

			const userArray = await this.removeMatchingRecords(errorArray, userDataInstances);
			let successCount = 0;
			if (userArray.length) {
				for (let i = 0; i < userArray.length; i++) {
					const user = userArray[i];

					const emailExists = await this.users.findOne({
						where: {
							email: user.email,
						},
					});

					if (emailExists) {
						const errorObj = {
							employeeId: user.employeeId,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
							errorReason: AppMessages.existedEmail,
							role: user.role,
							joiningDate: user.joiningDate,
							reportToId: user.reportToId,
						};
						errorArray.push(errorObj);
						continue;
					}

					const mobileNumberExists = await this.users.findOne({
						where: {
							mobileNumber: user.mobileNumber,
						},
					});

					if (mobileNumberExists) {
						const errorObj = {
							employeeId: user.employeeId,
							firstName: user.firstName,
							lastName: user.lastName,
							email: user.email,
							errorReason: AppMessages.existedMobileNumber,
						};
						errorArray.push(errorObj);
						continue;
					}

					const plainPassword = PasswordHelper.generateTemporaryPassword();
					const hashedPassword = PasswordHelper.hashPassword(plainPassword);

					user.password = hashedPassword;
					user.userType = UserType.User;
					user.tenantIds = [tenantId];

					let createUser;

					if (user.tenantVariables && user.tenantVariables.length) {
						const tenantVariables = [];
						const validateVariableValue = await this.validateImportUserVariables(user.tenantVariables);
						if (validateVariableValue) {
							const errorObj = {
								employeeId: user.employeeId,
								firstName: user.firstName,
								lastName: user.lastName,
								email: user.email,
								errorReason: validateVariableValue,
							};
							errorArray.push(errorObj);
							continue;
						}
						tenantVariables.push({ tenantId: tenantId, variables: user.tenantVariables });
						await this.validateTenantVariable(tenantVariables, tenantId);
						createUser = await this.users.create(user);
						successCount++;

						this.addTenantVariables(tenantVariables, createUser.id, createdBy.id);
					} else {
						createUser = await this.users.create(user);
						successCount++;
					}

					if (createUser) {
						const emailSubject = await EmailSubjects.accountActivationSubject(tenantExists.name);
						const emailBody = EmailTemplates.accountActivationEmail(
							tenantExists.name,
							user.firstName,
							user.lastName,
							user.email,
							plainPassword,
							FRONTEND_URL,
						);
						await Email.sendEmail(user.email, emailSubject, emailBody);
					}
				}
			}
			let uniqueEmployees;
			if (errorArray && errorArray.length) {
				uniqueEmployees = errorArray.filter((employee, index, self) => index === self.findIndex(e => e.employeeId == employee.employeeId));
				const excelErrorBuffer = await this.excelService.createAndUploadExcelFile(uniqueEmployees);
				const excelBuffer: Buffer = Buffer.from(excelErrorBuffer);
				const errorReportSubject = 'Import User Failed Report';
				const attachments = [
					{
						filename: 'ErrorReport.xlsx', // The name of the file
						content: excelBuffer,
						contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
					},
				];
				const emailBody = EmailTemplates.errorReportEmail(createdBy.firstName, createdBy.lastName);
				await Email.sendEmail(createdBy.email, errorReportSubject, emailBody, attachments);
			}

			const errorCount = {
				failureCount: uniqueEmployees?.length || 0,
				successCount: successCount,
			};
			return errorCount;
		} catch (error) {
			throw new ServerException(AppMessages.somethingWentWrong);
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
	public async selectUser(userDetails: SelectUserData[], tenantId: number) {
		const userIdsSet = new Set<number>();
		const userDetailsMap = new Map<number, { firstName: string; lastName: string; profilePhoto: string }>();

		for (const user of userDetails) {
			const { email, mobileNumber, employeeId } = user;
			const whereClause = {
				tenantIds: {
					[Op.contains]: [tenantId],
				},
				isDeleted: false,
				isActive: true,
				[Op.or]: [],
			};

			if (email) whereClause[Op.or].push({ email });
			if (mobileNumber) whereClause[Op.or].push({ mobileNumber });
			if (employeeId) whereClause[Op.or].push({ employeeId });

			if (whereClause[Op.or].length === 0) continue;

			const users = await this.users.findAll({
				where: whereClause,
				attributes: ['id', 'firstName', 'lastName', 'profilePhoto'],
			});

			if (Array.isArray(users)) {
				users.forEach(user => {
					userIdsSet.add(user.id);
					userDetailsMap.set(user.id, {
						firstName: user.firstName,
						lastName: user.lastName,
						profilePhoto: user.profilePhoto,
					});
				});
			}
		}

		const userIds = Array.from(userIdsSet);
		const userDetailsArray = userIds.map(id => ({
			id,
			...userDetailsMap.get(id),
		}));

		return userDetailsArray;
	}
}

export default UserService;
