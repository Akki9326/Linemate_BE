import DB from '@/databases';
import { Op } from 'sequelize';

export class CountryService {
	private countryModel = DB.Country;
	constructor() {}
	public async list(pageModel) {
		const { page, limit, search } = pageModel;
		let whereClause;
		if (search) {
			whereClause = {
				[Op.or]: {
					name: { [Op.iLike]: `%${pageModel.search}%` },
					isdCode: { [Op.iLike]: `%${pageModel.search}%` },
				},
			};
		}

		const offset = (page - 1) * limit || 0;

		const { count, rows } = await this.countryModel.findAndCountAll({
			where: {
				...whereClause,
			},
			nest: true,
			distinct: true,
			limit: limit ?? 10,
			offset: offset,
		});

		return {
			total: count,
			data: rows,
		};
	}
}
