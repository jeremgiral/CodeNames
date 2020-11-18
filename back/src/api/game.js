"use strict"
const status = require("http-status")
const socketioJwt = require("socketio-jwt")
const jwt = require("jsonwebtoken")
module.exports = (app, options, io) => {
  const { model } = options

  io.use(
    socketioJwt.authorize({
      secret: options.JWTSettings.secret,
      handshake: true,
    })
  )
  io.on("connection", (socket) => {
    console.log(
      "hello ! ",
      socket.decoded_token.nomUser,
      socket.id,
      socket.decoded_token.socketId,
      socket.handshake.query.token,
      jwt.verify(socket.handshake.query.token, options.JWTSettings.secret)
    )
    if (socket.decoded_token.socketId !== socket.id) {
      model.users
        .updateSocket(socket.decoded_token, socket.id)
        .then((user, games) => {
          socket.client.user = user
          if (games) {
            games.forEach((g) => {
              io.emit("updatedGame", g)
            })
          }
        })
    }
    socket.on("socket", (user) => {
      if (user) {
        model.users.updateSocket(user, socket.id).then((user, games) => {
          socket.client.user = user
          if (games) {
            games.forEach((g) => {
              io.emit("updatedGame", g)
            })
          }
        })
      }
    })
    socket.on("newGame", (user) => {
      user.socketId = socket.id
      model.games.createNewGame(user).then((game) => {
        io.emit("sendNewGame", game)
      })
    })

    socket.on("joinGame", (data) => {
      let { user, refGame } = data
      user.socketId = socket.id
      model.games.joinGame(user, refGame).then((game) => {
        socket.join(game.refRoom)
        io.emit("updatedGame", game)
      })
    })
    socket.on("startGame", (data) => {
      model.games.startGame(data).then((game) => {
        model.games.getRandomWords().then((words) => {
          game.words = words
          model.games.composeTeams(data).then((teams) => {
            game = { ...game, ...teams }
            model.games.setGuesser(game).then((game) => {
              game.users.forEach((user) => {
                if (io.sockets.connected[user.socketId]) {
                  io.sockets.connected[user.socketId].join(game.refRoom)
                }
              })
              model.games.getRandomMap(game).then((game) => {
                model.games.updateGame(game).then((game) => {
                  io.to(game.refRoom).emit("updatedGame", game)
                })
              })
            })
          })
        })
      })
    })
    socket.on("updateGame", (data) => {
      model.games.updateGame(data.game).then((game) => {
        io.to(game.refRoom).emit("updatedGame", game)
      })
    })
    socket.on("sendIndice", (data) => {
      model.games.receivedIndice(data).then((game) => {
        model.games.updateGame(game).then((game) => {
          io.to(game.refRoom).emit("updatedGame", game)
        })
      })
    })
    socket.on("playTile", (data) => {
      model.games.getResultTile(data).then((game) => {
        model.games.updateGame(game).then((game) => {
          io.to(game.refRoom).emit("updatedGame", game)
        })
      })
    })
    socket.on("endTurn", (game) => {
      game.numberAnswer = 0
      game.turn =
        game.turn.color === "blue"
          ? { type: "spy", team: "red" }
          : { type: "spy", team: "blue" }
      game.turnPlayers =
        game.turn.color === "blue"
          ? [game.guesser.blueTeam[game.guesserIndex]]
          : [game.guesser.redTeam[game.guesserIndex]]
      model.games.updateGame(game).then((game) => {
        io.to(game.refRoom).emit("updatedGame", game)
      })
    })
  })
  app.get("/games", (req, res, next) => {
    model.games
      .getAllGames()
      .then((games) => {
        res.status(status.OK).json(games)
      })
      .catch(next)
  })

  app.get("/tiles", (req, res, next) => {
    model.games
      .getRandomWords()
      .then((tiles) => res.status(status.OK).json(tiles))
      .catch(next)
  })
  app.get("/map", (req, res, next) => {
    model.games
      .getRandomMap()
      .then((map) => res.status(status.OK).json(map))
      .catch(next)
  })
  /**
   * @api {get} /sample Renvoie un example de retour
   * @apiName GetSample
   * @apiGroup Sample
   *
   * @apiSuccess {String} sample response
   */
  app.get("/games/:refGame", (req, res, next) => {
    const { refGame } = req.params
    model.games
      .getGame(refGame)
      .then((game) => {
        res.status(status.OK).json(game)
      })
      .catch(next)
  })
}
