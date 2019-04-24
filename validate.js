function validateBodyDelete(body) {
    if (!body.hasOwnProperty('TODO')) {
        throw new Error("delete: required argument 'TODO' not found");
    }
}

function validateBodyRead(body) {
    if (!body.hasOwnProperty('TODO')) {
        throw new Error("read: required argument 'TODO' not found");
    }
}

function validateBodyCreate(body) {
    if (!body.hasOwnProperty('TODO')) {
        throw new Error("create: required argument 'TODO' not found");
    }
}

module.exports = {
    delete : validateBodyDelete,
    create : validateBodyCreate,
    read : validateBodyRead
}