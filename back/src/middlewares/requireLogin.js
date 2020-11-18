module.exports = (req, res, next) => {
  const user = req.headers.user
  if (!user || !(Object.keys(user).length > 0)) {
    return res.status(401).send({ error: "You must log in!" })
  }
  req.user = user
  return next()
}
