const {
  dbSettings,
  serverSettings,
  bcryptSettings,
  JWTSettings
} = require("./config")
const db = require("./mongo")

module.exports = { dbSettings, serverSettings, bcryptSettings, JWTSettings, db }
