import { AppPermission } from "@/models/enums/app-access.enum";
import { CacheService } from "./cache.service";
import DB from "@/databases";
import { PermissionModel } from "@/models/db/permissions.model";

export class RoleService {

    constructor() {
    }

    async getAccessByRoleId(roleId: number): Promise<AppPermission[]> {
        const cacheAccess = await CacheService.instance.getJson<AppPermission[]>(this.getCacheKey(roleId));
        if (cacheAccess)
            return cacheAccess;

        const roleDetails = await DB.Roles.findOne({
            where: {
                id: roleId,
                isActive: true
            },
            include: {
                model: PermissionModel,
                as: 'permissions'
            }
        });

        const permissions = roleDetails ?.permissions ?.filter(f => f.isActive).map(p => p.name) || [];

        await CacheService.instance.setJson(this.getCacheKey(roleId), permissions);
        return permissions;
    }

    async getAccessByRoleIds(roleIds: number[]): Promise<AppPermission[]> {
        const permissions = [];

        const permissionPromise = roleIds.map(async (roleId) => {
            const rolPermission = await this.getAccessByRoleId(roleId);

           permissions.push(...rolPermission);
            return rolPermission;
        });

        await Promise.all(permissionPromise);

        return permissions;
    }

    async clearRoleCache(roleId): Promise<void> {
        await CacheService.instance.delete(this.getCacheKey(roleId))
    }

    private getCacheKey(roleId: number) {
        return `Role_${roleId}`;
    }

}