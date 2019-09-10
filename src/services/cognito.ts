import { AWS, cognitoUserPoolId } from '../env';
import { PaymentStatus } from './sns';
import { CognitoIdentityServiceProvider as CognitoTypes } from 'aws-sdk';
import { XOR } from 'ts-xor';
import { UserData, PaymentProvider, newUserAttributes } from '@eximchain/dappbot-types/spec/user';
import { StripePlans } from '@eximchain/dappbot-types/spec/methods/payment';
const cognito = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });

function formatUser(user:XOR<CognitoTypes.AdminGetUserResponse, CognitoTypes.UserType> | undefined):UserData | null{
    if (!user) return null;
    let Attributes = user.Attributes || user.UserAttributes || [];
    const { PreferredMfaSetting, UserMFASettingList, MFAOptions } = user;
    const emailAttr = Attributes.find(({ Name }) => Name === 'email') as CognitoTypes.AttributeType;
    return {
        Username : user.Username as string,
        Email : emailAttr.Value as string,
        UserAttributes : Attributes.reduce((attrObj, attr) => {
            attrObj[attr.Name] = attr.Value || '';
            return attrObj
        }, newUserAttributes()),
        PreferredMfaSetting, UserMFASettingList, MFAOptions
    }
}

async function promiseAdminGetUser(cognitoUsername: string) {
    let params = {
        UserPoolId: cognitoUserPoolId,
        Username: cognitoUsername
    };
    const user = await cognito.adminGetUser(params).promise();
    return formatUser(user);
}

function numPlanAttribute(plans: StripePlans, typeOfPlan: keyof StripePlans) {
    let planName = `custom:${typeOfPlan}_limit`
    return {
        Name: planName,
        Value: (plans[typeOfPlan] || 0).toString()
    }
}

export async function promiseUpdateDapps(email: string, plans: StripePlans) {
    let params = {
        "UserAttributes": [
            numPlanAttribute(plans, "standard"),
            numPlanAttribute(plans, "enterprise"),
            numPlanAttribute(plans, "professional")
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

export async function promiseAdminCreateUser(email: string, plans: StripePlans) {
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
            numPlanAttribute(plans, "standard"),
            numPlanAttribute(plans, "enterprise"),
            numPlanAttribute(plans, "professional"),
            {
                Name: 'custom:payment_status',
                Value: PaymentStatus.ACTIVE
            },
            {
                Name: 'custom:payment_provider',
                Value: PaymentProvider.STRIPE
            }
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
