import DB from '@/databases';
import { Op } from 'sequelize';

export class CountryService {
	private countryModel = DB.Country;
	constructor() {}
	public async list(pageModel) {
		const { page, pageSize, searchTerm } = pageModel;
		let whereClause;
		if (searchTerm) {
			whereClause = {
				[Op.or]: {
					name: { [Op.iRegexp]: pageModel.searchTerm },
					isdCode: { [Op.iRegexp]: pageModel.searchTerm },
				},
			};
		}

		const offset = (page - 1) * pageSize || 0;

		const { count, rows } = await this.countryModel.findAndCountAll({
			where: {
				...whereClause,
			},
			nest: true,
			distinct: true,
			limit: pageSize ?? 10,
			offset: offset,
		});

		return {
			total: count,
			data: rows,
		};
	}
}
