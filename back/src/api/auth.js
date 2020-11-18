const status = require("http-status")
const passport = require("passport")
const uuid = require("uuid")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const requireLogin = require("../middlewares/requireLogin")
const socketAuth = require("socketio-auth")

module.exports = (app, options, io) => {
  const { model } = options
  socketAuth(io, {
    authenticate: async (socket, data, callback) => {
      const { user, password } = data
      model.users.getUserByName(user).then((user) => {
        if (!user) return callback(new Error("Cet utilisateur n'existe pas"))
        model.users.updateSocket(user, socket.id).then((user, games) => {
          if (games) {
            games.forEach((g) => {
              io.emit("updatedGame", g)
            })
          }
          return callback(null, bcrypt.compare(password, user.password))
        })
      })
    },
    postAuthenticate: (socket, data) => {
      const { user } = data
      model.users.getUserByName(user).then((user) => {
        socket.client.user = user
      })
    },
    disconnect: (socket) => {
      console.log(`Socket ${socket.id} disconnected.`)
    },
    timeout: "none",
  })
  app.post("/auth/login", (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          ...info,
        })
      }
      return req.login(user, { session: false }, (errLogin) => {
        if (errLogin) {
          res.send(errLogin)
        }
        const token = jwt.sign(user, options.JWTSettings.secret)
        return res.json({ token })
      })
    })(req, res, next)
  })

  app.get("/users/current", requireLogin, (req, res) => {
    res.status(status.OK).json(req.user)
  })

  app.post("/users", (req, res, next) => {
    const user = req.body
    if (user.refUser === undefined) user.refUser = uuid.v4()
    bcrypt.genSalt(options.saltRounds, (err, salt) => {
      bcrypt.hash(user.password, salt, (hashErr, hash) => {
        user.hashedPassword = hash
        model.users
          .createUser(user)
          .then((createdUser) => {
            res.status(status.OK).send({
              user: { ...createdUser },
            })
          })
          .catch((createUserErr) => {
            res.send(createUserErr).status(400)
            return next(createUserErr)
          })
      })
    })
  })
}
