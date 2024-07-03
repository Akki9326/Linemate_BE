import { BadRequestException } from '@/exceptions/BadRequestException'

export const TokenValidator = {
    tokenExpiry: (expireTime: number) => {
        let currentTimeInNumbers = new Date().getTime()
        if (expireTime && (expireTime < currentTimeInNumbers)) {
            throw new BadRequestException("The link has been expired.")
        }
        return "Token valid";
    },

    urlChecker: (dbToken: string, reqResetToken: string) => {
        if (dbToken !== reqResetToken) {
            throw new BadRequestException("Invalid url.")
        }

        return "Url valid"
    },

    tokenConsumed: (status: boolean) => {
        if (!status) throw new BadRequestException("This url is already used.")

        return "Token is active."
    }
}