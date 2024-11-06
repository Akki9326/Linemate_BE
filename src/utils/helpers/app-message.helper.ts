import { FileMimeType } from '@/models/enums/file-type.enums';

export const AppMessages = {
	forgotPasswordSuccess: 'We’ll send you an email with a password reset link if your email is registered with us.',
	invalidUsername: 'Please check the email or mobile number.',
	emptyUsername: 'Email or phone number must be provided.',
	invalidPassword: 'Invalid password.',
	inactiveUser: 'User is not active.',
	lockedUser: 'User is locked. Please contact admin.',
	accountLocked: 'Account is locked due to too many failed login attempts.',
	expiredOtp: 'OTP has expired.',
	userNotFound: 'User not found.',
	deActiveUserNotFound: 'De Active Users not found.',
	activeUserNotFound: 'Active Users not found.',
	passwordReused: 'New password cannot be the same as the last 5 passwords.',
	existedUser: 'User already exists',
	existedEmail: 'Email already exists',
	existedMobileNumber: 'Mobile number already exists',
	maxAdmin: 'Max admin allowed for admin users.',
	wrongOldPassword: 'Old password not valid.',
	invalidPayload: 'Invalid req data from req.',
	invalidFileType: `Invalid file extension type. type must be valid for : ${[...Object.keys(FileMimeType)]}`,
	headerTenantId: 'tenantId not found in header',
	isRequired: 'is required.',
	somethingWentWrong: 'Something went wrong, please try again',
	InvalidFilterDate: 'Invalid Date',
};

export const RoleMessage = {
	roleNotFound: 'Role not found',
};
export const PermissionMessage = {
	permissionAlready: 'Permission already exists',
	permissionNotFound: 'Permission not found',
};
export const TenantMessage = {
	requiredTenant: 'tenantIds is required',
	requiredTenantId: 'tenantId is required',
	requiredTenantFilter: 'tenantId is required in filter',
	tenantNotFound: 'Tenant not found',
	tenantVariableNotFound: 'Tenant variable not found',
	trademarkIsAlreadyExists: 'Trademark is already exists in our system',
	invalidGstNumber: 'Invalid Gst number',
	gstNumberIsAlreadyExists: 'Gst number is already exists in our system',
	companyNameIsAlreadyExists: 'Company name is already exists in our system',
	tenantNameLength: 'Company name length should be greater than 25',
	workSpaceNotFound: 'Work space not found in this tenant',
	requiredChannel: 'channel is required',
};
export const VariableMessage = {
	variableNotFound: 'variable not found',
	possibleOptionRequired: 'options is required',
	NotAddStandard: 'standard variable not allowed to add',
	NotEditStandard: 'standard variable not allowed to edit',
	NotDeleteStandard: 'standard variable not allowed to delete',
	textVariableMustString: 'Text variable value must be a string',
	numericVariableMustNumber: 'Numeric variable value must be a Number',
	singleSelectMustMustBeAnOptions: 'Single select variable value must be an options',
	multiSelectMustMustBeAnOptions: 'Multi select variable value must be an options',
	variableIsRequired: (variabledName: string) => `${variabledName} is required`,
	variableValueIsInvalid: (variabledName: string) => `${variabledName} is invalid`,
};
export const CommonMessage = {
	filterIsRequired: 'filter is required',
};
export const ContentMessage = {
	contentNotFound: 'content not found',
	notFoundArchiveContent: 'not found archive content.',
	notFoundUnArchiveContent: 'not found un archive content.',
};

export const assessmentMessage = {
	assessmentNotFound: 'assessment not found',
	correctAnswerIsRequired: 'correct answer is required',
	correctAnswerIsNotInOptions: 'correct answer is should be in options',
	scoreIsRequiredInPerQuestion: 'score is required in Per question type scoring',
	scoreIsRequiredInMaxScoreTypeQuestion: 'score is required in Max question type scoring',
	questionIsMissing: 'question is missing',
	questionNotFound: 'question not found',
	optiopnIsMissing: 'option is missing',
	passIsMissing: 'pass is required',
};

export const CohortMessage = {
	cohortNotFound: 'cohort not found',
	userIdsRequired: 'userIds required',
};
export const FilterMessage = {
	filterForNotFound: 'filterFor is required in query params',
};

export const CampaignMessage = {
	campaignNotFound: 'campaign not found',
	campaignInProgress: 'campaign not found or in progress',
	cannotCreateCampaign: 'error create campaign',
	camapignTriggered: 'campaign already triggered',
	fynoApiError: 'error fetching data try later',
	campaignExpired: 'campaign is expired',
	campaignNameTaken: 'campaign name already taken',
};
export const CommunicationMessage = {
	communicationNotFound: 'communication not found',
	communicationAlreadyExists: 'communication already exists',
	workSpaceNotFound: 'communication workSpace not found',
};
export const TemplateMessage = {
	templateNotFound: 'template not found',
	templateAlreadyExists: 'template already exists',
	notFoundArchiveTemplate: 'not found archive template.',
	notFoundUnArchiveTemplate: 'not found un archive template.',
	headerMediaUrlRequired: 'headerMediaUrl is required',
	captionRequired: 'caption is required',
	messageTextRequired: 'messageText is required',
};
