require("dotenv").config()

// we load all the depencies we need
const server = require("./server/server")
const models = require("./models")
const config = require("./config")

// verbose logging when we are starting the server
console.log("=======================")
console.log("--- CodeNames Service ---")
console.log("=======================")
console.log("⏳⏳ Connecting to the database ⏳⏳")

async function startServer() {
  try {
    const db = await config.db.connect(config.dbSettings)
    console.log("Database connection OK 👌")
    const model = models.connect(db)
    console.log("Models OK 👌")
    server
      .start({
        db,
        port: config.serverSettings.port,
        model,
        bcryptSettings: config.bcryptSettings,
        JWTSettings: config.JWTSettings
      })
      .then(app => {
        console.log(
          `Server started succesfully, running on port: ${config.serverSettings.port}. ✅`
        )

        app.on("close", rep => {
          rep.disconnect()
        })
      })
  } catch (error) {
    console.error(error)
  }
}

startServer()
