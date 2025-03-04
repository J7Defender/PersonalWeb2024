const showAlert = (error, req, res, next) => {
  return res.redirect(req.path + "?alert=" + error.message);
};

export { showAlert };