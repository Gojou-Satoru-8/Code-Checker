module.exports = (req, res, next) => {
  console.log("Flash controller: ", req.query);

  const { msg, err, redirectUrl } = req.query;
  res.flash("msg", msg);
  res.flash("err", err);
  res.redirect(redirectUrl);
};
