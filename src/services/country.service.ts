import DB from '@/databases';
import { Op } from 'sequelize';

export class CountryService {
	private countryModel = DB.Country;
	constructor() {}
	public async list(pageModel) {
		let { page, pageSize, searchTerm, sortField, sortOrder, ...whereClause } = pageModel;

		if (searchTerm) {
			whereClause = {
				...whereClause,
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
