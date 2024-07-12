import DB from '@/databases';

export const VariableHelper = {
    findTenantVariableDetails: async (userId: number, tenantId: number) => {
        let allVariable = await DB.VariableMatrix.findAll({
            where: {
                userId,
                tenantId,
                isDeleted: false
            },
            attributes: ['id', 'variableId', 'value']
        });
        if (!allVariable.length) {
            return [];
        }
        const attributes = ['name']
        const responseList = await Promise.all(allVariable.map(async (item) => {
            const variableLabelDetails = await VariableHelper.findVariable(item.variableId, attributes)
            return {
                ...item.dataValues,
                variableLabelDetails,
            };
        }));
        return responseList
    },
    findVariable: async (variableId: number, attributes: any[]) => {
        return await DB.VariableMaster.findOne({ where: { id: variableId, isDeleted: false }, attributes: attributes })
    }
}