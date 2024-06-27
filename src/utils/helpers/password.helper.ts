
import * as bcrypt from 'bcrypt';

export const PasswordHelper = {
    hashPassword: (password: string) => {
        const encryptedPassword = bcrypt.hashSync(password, 8);
        return encryptedPassword;
    },
    validatePassword: (unencryptedPassword: string, encryptedPassword: string) => {
        return bcrypt.compareSync(unencryptedPassword, encryptedPassword);
    }
}