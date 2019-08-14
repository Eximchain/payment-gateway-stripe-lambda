// FUNCTIONS FOR MARSHALLING RESPONSES
export enum HTTPMethods {
  GET = 'GET',
  OPTIONS = 'OPTIONS',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE'
}

export interface ResponseOptions {
  isErr? : boolean
  isCreate? : boolean
  isRead? : boolean
  errorResponseCode? : number
}

function response(body:any, opts:ResponseOptions) {
  let responseCode = 200;
  // Override response code based on opts
  if (opts.isErr) {
      if (opts.errorResponseCode) {
          responseCode = opts.errorResponseCode;
      } else {
          responseCode = 500;
      }
  } else if (opts.isCreate) {
      responseCode = 201;
  } else if (opts.isRead) {
      if (body.hasOwnProperty("exists") && !body.exists) {
          // Dapp Not Found
          // This looks like a success response but uses error code 404
          responseCode = 404;
      }
  }

  let responseHeaders = {
      'Content-Type': 'application/json', 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type'
  };
  

  let dataField = opts.isErr ? {} : body;
  let errField = opts.isErr ? body : null;
  let responseBody = {
      data: dataField,
      err: errField
  };
  return {
      statusCode: responseCode,
      headers: responseHeaders,
      body: JSON.stringify(responseBody)
  }
}

export function successResponse(body:any, opts:ResponseOptions={isCreate: false}) {
  let successOpt = {isErr: false};
  let callOpts = {...opts, ...successOpt};
  return response(body, callOpts);
}

export function errorResponse(body:any, opts:ResponseOptions={isCreate: false}) {
  let errorOpt = {isErr: true};
  let callOpts = {...opts, ...errorOpt};
  return response(body, callOpts);
}

export function userErrorResponse(body:any, opts:ResponseOptions={isCreate: false}) {
  let errorOpt = {isErr: true, errorResponseCode : 400 };
  let callOpts = {...opts, ...errorOpt};
  return response(body, callOpts);
}

export function unexpectedErrorResponse(body:any, opts:ResponseOptions={isCreate: false}) {
  let errorOpt = {isErr: true, errorResponseCode : 500 };
  let callOpts = {...opts, ...errorOpt};
  return response(body, callOpts);
}