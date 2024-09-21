import CohortMasterModel from '@/models/db/cohortMaster.model';
import CohortMatrixModel from '@/models/db/cohortMatrix.model';
import ContentModel from '@/models/db/content.model';
import CountryModel from '@/models/db/country.model';
import PermissionModel from '@/models/db/permissions.model';
import RoleModel from '@/models/db/role.model';
import TenantModel from '@/models/db/tenant.model';
import UploadedFileModel from '@/models/db/uploadedFile.model';
import UserPasswordModel from '@/models/db/userPassword.model';
import UserTokenModel from '@/models/db/userToken.model';
import UserVariableMasterModel from '@/models/db/userVariableMaster';
import UserVariableMatrixModel from '@/models/db/userVariableMatrix';
import UserModel from '@/models/db/users.model';
import AssessmentMasterModel from '@/models/db/assessmentMaster';
import AssessmentQuestionMatrix from '@/models/db/assessmentQuestionMatrix';
import AssessmentOptionModel from '@/models/db/assessmentOption';
import SkillMatrixModel from '@/models/db/skillMatrix';
import CampaignMasterModel from '@/models/db/campaignMastel';
import CampaignMatrixModel from '@/models/db/campaignMatrix'
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
	benchmark: false,
	logging: false,
});

sequelizeConnect.authenticate();

const DB = {
	UserPassword: UserPasswordModel(sequelizeConnect),
	UserToken: UserTokenModel(sequelizeConnect),
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
	SkillMatrix: SkillMatrixModel(sequelizeConnect),
	CohortMaster: CohortMasterModel(sequelizeConnect),
	CohortMatrix: CohortMatrixModel(sequelizeConnect),
	CampaignMaster: CampaignMasterModel(sequelizeConnect),
	CampaignMatrix: CampaignMatrixModel(sequelizeConnect),
	sequelizeConnect, // connection instance (RAW queries)
	Sequelize, // library
};
export default DB;
