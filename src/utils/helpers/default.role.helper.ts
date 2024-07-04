import { UserType } from "@/models/enums/user-types.enum";

const userTypeDefaultRoles = {
    "Company admin": [1],
    "Support user": [2],
    "User": [3],
};

export const findDefaultRole = (userType: UserType) => {
    return userTypeDefaultRoles[UserType[userType]];
}