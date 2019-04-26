 const errorHandler = next => err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
}

module.exports=  errorHandler