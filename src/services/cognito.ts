import { AWS, cognitoUserPoolId } from '../env';
import { StripePlan } from './stripe';
import { CognitoIdentityServiceProvider as CognitoTypes, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AdminGetUserResponse } from 'aws-sdk/clients/cognitoidentityserviceprovider';
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

async function promiseAdminGetUser(cognitoUsername: string) {
    let params = {
        UserPoolId: cognitoUserPoolId,
        Username: cognitoUsername
    };
    const user = await cognito.adminGetUser(params).promise();
    user.UserAttributes = user.UserAttributes || [];
    if (!user) {
        return false;
    }
    const { PreferredMfaSetting, UserMFASettingList, MFAOptions, UserAttributes } = user;
    const emailAttr = UserAttributes.find(({ Name }) => Name === 'email') as CognitoTypes.AttributeType;
    return {
        Username: user.Username,
        Email: emailAttr.Value as string,
        UserAttributes: UserAttributes.reduce((attrObj, attr) => {
            attrObj[attr.Name] = attr.Value || '';
            return attrObj
        }, {} as AttributeMapType),
        PreferredMfaSetting, UserMFASettingList, MFAOptions
    } as DappBotUser;
    return user;
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
    return cognito.adminCreateUser(params).promise();
}


export default {
    createUser: promiseAdminCreateUser,
    updateDapps: promiseUpdateDapps,
    getUser: promiseAdminGetUser
}
