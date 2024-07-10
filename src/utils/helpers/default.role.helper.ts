import { UserType } from "@/models/enums/user-types.enum";

const userTypeDefaultRoles = {
    CompanyAdmin: [1],
    SupportUser: [2],
    User: [3],
};

export const findDefaultRole = (userType: UserType) => {
    return userTypeDefaultRoles[UserType[userType]];
}