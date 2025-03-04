const showAlert = (error, req, res) => {
  return res.redirect(req.path + "?alert=" + error.message);
};

export { showAlert };