import { AWS, cognitoUserPoolId } from '../env';
import { StripePlan } from './stripe';
import { CognitoIdentityServiceProvider as CognitoTypes, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AdminGetUserResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { XOR } from 'ts-xor';
const cognito = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });

export type AttributeMapType = { [Name: string]: CognitoTypes.AttributeValueType }

export interface DappBotUser {
    Username: string
    Email: string
    UserAttributes: AttributeMapType
    /**
     * Specifies the options for MFA (e.g., email or phone number).
     */
    MFAOptions?: CognitoTypes.MFAOptionListType;
    /**
     * The user's preferred MFA setting.
     */
    PreferredMfaSetting?: string;
    /**
     * The list of the user's MFA settings.
     */
    UserMFASettingList?: CognitoTypes.UserMFASettingListType;
}

function formatUser(user:XOR<CognitoTypes.AdminGetUserResponse, CognitoTypes.UserType> | undefined){
    if (!user) return false;
    let Attributes = user.Attributes || user.UserAttributes || [];
    const { PreferredMfaSetting, UserMFASettingList, MFAOptions } = user;
    const emailAttr = Attributes.find(({ Name }) => Name === 'email') as CognitoTypes.AttributeType;
    return {
        Username : user.Username as string,
        Email : emailAttr.Value as string,
        UserAttributes : Attributes.reduce((attrObj, attr) => {
            attrObj[attr.Name] = attr.Value || '';
            return attrObj
        }, {} as AttributeMapType),
        PreferredMfaSetting, UserMFASettingList, MFAOptions
    } as DappBotUser
}

async function promiseAdminGetUser(cognitoUsername: string) {
    let params = {
        UserPoolId: cognitoUserPoolId,
        Username: cognitoUsername
    };
    const user = await cognito.adminGetUser(params).promise();
    return formatUser(user);
}

function numDapps(plans: StripePlan[], typeOfPlan: string) {
    let planName = `custom:${typeOfPlan}_limit`
    return {
        Name: planName,
        Value: '1'
    }
}

export async function promiseUpdateDapps(email: string, plans: StripePlan[]) {
    let params = {
        "UserAttributes": [
            numDapps(plans, "standard"),
            numDapps(plans, "enterprise"),
            numDapps(plans, "professional")
        ],
        "Username": email,
        "UserPoolId": cognitoUserPoolId
    }
    return cognito.adminUpdateUserAttributes(params).promise();
}

function generatePassword(length: number) {
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

export async function promiseAdminCreateUser(email: string, plans: StripePlan[]) {
    let params = {
        UserPoolId: cognitoUserPoolId,
        Username: email,
        DesiredDeliveryMediums: [
            "EMAIL"
        ],
        ForceAliasCreation: false,
        TemporaryPassword: generatePassword(10),
        UserAttributes: [
            {
                Name: 'email',
                Value: email
            },
            {
                Name: 'email_verified',
                Value: 'true'
            },
            numDapps(plans, "standard"),
            numDapps(plans, "enterprise"),
            numDapps(plans, "professional"),
        ]
    }

    const createResult = await cognito.adminCreateUser(params).promise();
    return formatUser(createResult.User)
}


export default {
    createUser: promiseAdminCreateUser,
    updateDapps: promiseUpdateDapps,
    getUser: promiseAdminGetUser
}
