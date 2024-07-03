import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';

export class TanantDto {

    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsNotEmpty()
    public companyType: string;

    @IsString()
    @IsNotEmpty()
    public trademark: string;

    @IsNumber()
    @IsNotEmpty()
    public phoneNumber: number

    @IsString()
    @IsNotEmpty()
    public gstNumber: string;

    @IsString()
    @IsNotEmpty()
    public currencyCode: string;

    @IsNumber()
    @IsNotEmpty()
    public isdCode: string;

    @IsString()
    @IsNotEmpty()
    public clientType: string;

    @IsString()
    public authorisedFirstName: string;

    @IsString()
    public authorisedLastName: string;

    @IsString()
    public authorisedEmail: string;

    @IsNumber()
    public authorisedMobileNo: string;

    @IsString()
    public companyAddress: string;

    @IsString()
    public companyCountry: string;

    @IsString()
    public companyState: string;

    @IsString()
    public companyCity: string;

    @IsNumber()
    public companyPinCode: string;

    @IsString()
    public whitelistedIps: string;
}
