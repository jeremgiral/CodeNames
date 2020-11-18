const MongoClient = require("mongodb")

const getMongoURL = options => {
  return `mongodb://${options.host}:${options.port}`
}

const connect = options => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      getMongoURL(options),
      { useUnifiedTopology: true },
      (err, client) => {
        if (err) {
          reject("db.error", err)
        }
        const db = client.db(options.db)
        resolve(db)
      }
    )
  })
}

module.exports = { connect }
