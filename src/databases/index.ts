import AssessmentAnswerMatrix from '@/models/db/assessmentAnswerMatrix';
import AssessmentMasterModel from '@/models/db/assessmentMaster';
import AssessmentOptionModel from '@/models/db/assessmentOption';
import AssessmentQuestionMatrix from '@/models/db/assessmentQuestionMatrix';
import AssessmentResult from '@/models/db/assessmentResult';
import CampaignMaster from '@/models/db/campaignMastel';
import CampaignMatrix from '@/models/db/campaignMatrix';
import CampaignUserMatrixModel from '@/models/db/campaignUserMatrix.model';
import CohortMasterModel from '@/models/db/cohortMaster.model';
import CohortMatrixModel from '@/models/db/cohortMatrix.model';
import CommunicationModel from '@/models/db/communication.mode';
import ContentModel from '@/models/db/content.model';
import CountryModel from '@/models/db/country.model';
import languagesModel from '@/models/db/languages.model';
import PermissionModel from '@/models/db/permissions.model';
import RoleModel from '@/models/db/role.model';
import SkillMatrixModel from '@/models/db/skillMatrix';
import TemplateModel from '@/models/db/template.model';
import TemplateContentModel from '@/models/db/templateContent.model';
import TemplateContentButtonsModel from '@/models/db/templateContentButton.model';
import TemplateContentButtonsSectionModel from '@/models/db/templateContentButtonsSection';
import TemplateContentCardsModel from '@/models/db/templateContentCard.model';
import TenantModel from '@/models/db/tenant.model';
import UploadedFileModel from '@/models/db/uploadedFile.model';
import UserPasswordModel from '@/models/db/userPassword.model';
import UserModel from '@/models/db/users.model';
import UserTokenModel from '@/models/db/userToken.model';
import UserVariableMasterModel from '@/models/db/userVariableMaster';
import UserVariableMatrixModel from '@/models/db/userVariableMatrix';
import WorkSpaceModel from '@/models/db/workSpace.model';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from '@config';
import Sequelize from 'sequelize';

export const sequelizeConnect = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
	dialect: 'postgres',
	host: DB_HOST,
	port: parseInt(DB_PORT),
	database: DB_DATABASE,
	username: DB_USER,
	password: DB_PASSWORD,
	timezone: '+05:30',
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
	pool: {
		max: 10,
		min: 1,
		acquire: 30000,
	},
	benchmark: false,
	logging: false,
});

sequelizeConnect.authenticate();

const DB = {
	UserPassword: UserPasswordModel(sequelizeConnect),
	UserToken: UserTokenModel(sequelizeConnect),
	Languages: languagesModel(sequelizeConnect),
	Roles: RoleModel(sequelizeConnect),
	Tenant: TenantModel(sequelizeConnect),
	Permission: PermissionModel(sequelizeConnect),
	Users: UserModel(sequelizeConnect),
	Country: CountryModel(sequelizeConnect),
	VariableMaster: UserVariableMasterModel(sequelizeConnect),
	VariableMatrix: UserVariableMatrixModel(sequelizeConnect),
	Content: ContentModel(sequelizeConnect),
	UploadedFile: UploadedFileModel(sequelizeConnect),
	AssessmentMaster: AssessmentMasterModel(sequelizeConnect),
	AssessmentQuestionMatrix: AssessmentQuestionMatrix(sequelizeConnect),
	AssessmentOption: AssessmentOptionModel(sequelizeConnect),
	AssessmentResult: AssessmentResult(sequelizeConnect),
	AssessmentAnswerMatrix: AssessmentAnswerMatrix(sequelizeConnect),
	SkillMatrix: SkillMatrixModel(sequelizeConnect),
	CohortMaster: CohortMasterModel(sequelizeConnect),
	CohortMatrix: CohortMatrixModel(sequelizeConnect),
	Template: TemplateModel(sequelizeConnect),
	TemplateContent: TemplateContentModel(sequelizeConnect),
	TemplateContentButtons: TemplateContentButtonsModel(sequelizeConnect),
	TemplateContentButtonsSection: TemplateContentButtonsSectionModel(sequelizeConnect),
	TemplateContentCards: TemplateContentCardsModel(sequelizeConnect),
	CampaignMaster: CampaignMaster(sequelizeConnect),
	CampaignMatrix: CampaignMatrix(sequelizeConnect),
	CampaignUserMatrix: CampaignUserMatrixModel(sequelizeConnect),
	CommunicationModel: CommunicationModel(sequelizeConnect),
	WorkSpaceModel: WorkSpaceModel(sequelizeConnect),
	sequelizeConnect, // connection instance (RAW queries)
	Sequelize, // library
};
export default DB;
