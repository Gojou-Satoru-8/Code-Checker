const catchAsync = (handlerFunc) => {
  return (req, res, next) => handlerFunc(req, res, next).catch(next);
};

module.exports = catchAsync;
