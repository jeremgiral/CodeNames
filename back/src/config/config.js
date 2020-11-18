// database parameters
const dbSettings = {
  db: process.env.MONGO_DB || "codenames",
  host: process.env.MONGO_HOST || "mongo-codenames",
  port: process.env.MONGO_PORT || 27017,
  serverParameters: () => ({
    autoReconnect: true,
    poolSize: 10,
    socketoptions: {
      keepAlive: 300,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000
    }
  })
}
const bcryptSettings = {
  saltRounds: 10
}

const JWTSettings = {
  secret: "chihiro pig haters"
}
// server parameters
const serverSettings = {
  port: process.env.PORT || 3000
}

module.exports = { dbSettings, serverSettings, bcryptSettings, JWTSettings }
