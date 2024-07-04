
import * as bcrypt from 'bcrypt';

export const PasswordHelper = {
    hashPassword: (password: string) => {
        const encryptedPassword = bcrypt.hashSync(password, 8);
        return encryptedPassword;
    },
    validatePassword: (unencryptedPassword: string, encryptedPassword: string) => {
        return bcrypt.compareSync(unencryptedPassword, encryptedPassword);
    },
    generateTemporaryPassword: (length: number = 8) => {
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const digitChars = '0123456789';
        const specialChars = '@#$%^&*()_+|~-=`{}[]:;\<>?,./';
        const allChars = lowercaseChars + uppercaseChars + digitChars + specialChars;

        const passwordArray = [
            lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
            uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
            digitChars[Math.floor(Math.random() * digitChars.length)],
            specialChars[Math.floor(Math.random() * specialChars.length)],
        ];

        for (let i = 4; i < length; i++) {
            passwordArray.push(allChars[Math.floor(Math.random() * allChars.length)]);
        }

        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }

        return passwordArray.join('');
    }
}