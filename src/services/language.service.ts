import DB from '@/databases';

export class LanguageService {
	private languageModel = DB.Languages;
	constructor() {}
	public async list() {
		const response = await this.languageModel.findAll({});

		return response;
	}
}
