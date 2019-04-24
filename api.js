const validate = require('./validate');
const { dynamoDB, s3 } = require('./services');

async function apiCreate(body) {
    return new Promise(function(resolve, reject) {
        try {
            validate.create(body);
        } catch(err) {
            reject(err);
        }
        //TODO: API Create
       
    });
}

async function apiRead(body) {
    return new Promise(function(resolve, reject) {
        try {
            validate.read(body);
        } catch(err) {
            reject(err);
        }
        //TODO: API Read
    });
}

// TODO: Make sure incomplete steps are cleaned up
async function apiDelete(body) {
    return new Promise(function(resolve, reject) {
        try {
            validate.delete(body);
        } catch(err) {
            reject(err);
        }
        //TODO: API Delete
    });
}

module.exports = {
  create : apiCreate,
  read : apiRead,
  delete : apiDelete
}