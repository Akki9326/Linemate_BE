export const FilterHelper = {
	formatOptions: (options: string[]) => {
		return options.map(option => ({
			id: option,
			name: option,
		}));
	},
};
