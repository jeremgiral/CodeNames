const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const cors = require("cors")
const bodyParser = require("body-parser")
const passport = require("passport")
var http = require("http")
const gamesAPI = require("../api/game")
const authAPI = require("../api/auth")
const start = options => {
  return new Promise((resolve, reject) => {
    // we need to verify if we have a repository added and a server port
    if (!options.model) {
      return reject(
        new Error("The server must be started with a connected repository")
      )
    }
    if (!options.port) {
      return reject(
        new Error("The server must be started with an available port")
      )
    }
    // let's init a express app, and add some middlewares
    const app = express()

    app.use(morgan("dev"))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(helmet())
    app.use(cors())
    app.use(passport.initialize())
    app.use(passport.session())
    // Add the line below, which you're missing:
    require("../config/passport").model(options.model)
    require("../config/passport").initpassport(
      options.model,
      options.JWTSettings
    )
    app.use((req, res, next) => {
      passport.authenticate(
        "jwt",
        function(err, user, info) {
          if (err) {
            console.log(err)
            return next(err)
          }
          if (!user) {
            req.user = {}
          } else {
            req.user = user
            req.headers.user = user
          }
          next(null)
        },
        { session: false }
      )(req, res, next)
    })
    app.use((err, req, res, next) => {
      if (err) return res.status(500).send("Something went wrong!")
      return next()
    })

    // we add our API's to the express app

    var server = http.createServer(app)
    var io = require("socket.io")(server)

    server.listen(options.port)
    gamesAPI(app, options, io)
    authAPI(app, options, io)
    return resolve(app)
  })
}

module.exports = { start }
