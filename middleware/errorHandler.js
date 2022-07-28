/*
Code credits: https://github.com/pratik12350/rest-api-template/blob/main/middleware/errorHandler.js

this code here is not created or owned by Curiopost. 
If your the owner and would like this to be removed from our codebase please email us.

*/

const createError = require('http-errors');

const errorHandler = (error, req, res, next) => {
  console.error(error);
  if (error.expose === true) {
    res.status(error.status || 500).send(error);
  } else {
    res.status(500).send(createError.InternalServerError());
  }
};

module.exports = errorHandler;