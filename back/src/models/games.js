ObjectId = require("mongodb").ObjectID
const words = require("../data/words.json")
const uuid = require("uuid")

const listColor = [
  "#247ba0",
  "#70c1b3",
  "#b2dbbf",
  "#f3ffbd",
  "#ff1654",
  "#fe938c",
  "#e6b89c",
  "#ead2ac",
  "#9cafb7",
  "#4281a4",
]
const comparison = (a, b) => a !== b
const games = (db) => {
  // On se connecte à la collection mongo
  const collection = db.collection("games")
  return {
    getAllGames: () => {
      return new Promise((resolve) => {
        collection.find({}).toArray((err, games) => {
          if (err) throw err
          return resolve(games)
        })
      })
    },
    getGame: (refGame) => {
      return new Promise((resolve) => {
        collection.findOne({ _id: ObjectId(refGame) }, (err, game) => {
          if (err) throw err
          return resolve(game)
        })
      })
    },
    startGame: (data) => {
      return new Promise((resolve) => {
        const {
          numberPlayers,
          odd,
          isJoignable,
          triggerTimerMode,
          teamCompMode,
        } = data
        const refGame = data._id
        collection.findOne({ _id: ObjectId(refGame) }, (err, game) => {
          if (err) throw err
          const status = "En cours"
          const oldTimer = new Date(data.timer)
          const timer =
            oldTimer -
            new Date(
              `${oldTimer.getFullYear()}-${
                oldTimer.getMonth() + 1 < 10
                  ? "0" + oldTimer.getMonth() + 1
                  : oldTimer.getMonth() + 1
              }-${oldTimer.getDate()}T${oldTimer.getHours()}:00:00.000Z`
            )
          const guesserIndex = game.gameWinners.length
          if (game.gameWinners.length > 0) {
            teamCompMode = "manual"
          }
          game = {
            ...game,
            numberPlayers,
            odd,
            isJoignable,
            timer,
            triggerTimerMode,
            teamCompMode,
            status,
            endOfGame: false,
            endOfTurn: false,
            guesserIndex,
          }
          return resolve(game)
        })
      })
    },
    getRandomWords: () => {
      return new Promise((resolve) => {
        resolve(
          chunk(
            [...Array(25)].map(() => {
              return words.splice(
                Math.floor(Math.random() * words.length),
                1
              )[0]
            }),
            5
          )
        )
      })
    },
    getRandomMap: (game) => {
      return new Promise((resolve) => {
        const tiles = [...Array(25).keys()]
        const words = game.words.toString().split(",")
        const grid = [...Array(25)].map((_, i) => {
          return { color: "#C7B793", returned: false, word: words[i] }
        })
        Math.random() > 0.5 ? ((blue = 9), (red = 8)) : ((blue = 8), (red = 9))
        const bluePos = [...Array(blue)].map(
          () => tiles.splice(Math.floor(Math.random() * tiles.length), 1)[0]
        )
        bluePos.forEach(
          (tile) =>
            (grid[tile] = {
              color: "#0074A0",
              returned: false,
              word: words[tile],
            })
        ) //BLUE
        const redPos = [...Array(red)].map(
          () => tiles.splice(Math.floor(Math.random() * tiles.length), 1)[0]
        )
        redPos.forEach(
          (tile) =>
            (grid[tile] = {
              color: "#B81E22",
              returned: false,
              word: words[tile],
            })
        ) //RED
        grid[
          tiles.splice(Math.floor(Math.random() * tiles.length), 1)[0]
        ].color = "#413D3A"
        game.maps = chunk(grid, 5)
        if (blue == 9) {
          game.turn = { type: "spy", team: "blue" }
          game.turnPlayers = [
            game.guesser.blueTeam[
              game.guesserIndex % game.guesser.blueTeam.length
            ],
          ]
          game.scoreBlueTeam = 9
          game.scoreRedTeam = 8
        } else {
          game.turn = { type: "spy", team: "red" }
          game.turnPlayers = [
            game.guesser.redTeam[
              game.guesserIndex % game.guesser.redTeam.length
            ],
          ]
          game.scoreBlueTeam = 8
          game.scoreRedTeam = 9
        }
        resolve(game)
      })
    },
    composeTeams: (data) => {
      return new Promise((resolve) => {
        const { teamCompMode, users } = data
        if (teamCompMode === "auto") {
          users.sort((a, b) => 0.5 - Math.random())
          const [blueTeam, redTeam] = chunkTeams(users)
          resolve({ blueTeam, redTeam })
        } else {
          const { blueTeam, redTeam } = data
          resolve({ blueTeam, redTeam })
        }
      })
    },
    createNewGame: (user) => {
      return new Promise((resolve) => {
        user.avatar = listColor[Math.floor(Math.random() * listColor.length)]
        collection.insertOne(
          {
            refRoom: uuid.v4(),
            blueTeam: [],
            redTeam: [],
            votes: [],
            isJoignable: true,
            numberPlayers: 8,
            odd: false,
            triggerTimerMode: "manual",
            teamCompMode: "auto",
            users: [user],
            date: new Date(),
            status: "En attente de joueurs",
            timer: new Date("2020-03-29T00:01:30.000Z"),
            numberAnswer: 0,
            gameWinners: [],
          },
          (err, game) => {
            return resolve(game.ops[0])
          }
        )
      })
    },
    updateGame: (data) => {
      return new Promise((resolve) => {
        const refGame = data._id
        delete data._id
        collection.updateOne(
          { _id: ObjectId(refGame) },
          { $set: { ...data } },
          (err, status) => {
            if (err) throw err
            collection.findOne({ _id: ObjectId(refGame) }, (err, game) => {
              if (err) throw err
              return resolve(game)
            })
          }
        )
      })
    },
    setGuesser: (game) => {
      return new Promise((resolve) => {
        game.guesser = {
          blueTeam: game.blueTeam.sort((a, b) => 0.5 - Math.random()),
          redTeam: game.redTeam.sort((a, b) => 0.5 - Math.random()),
        }
        game.guesserRoom = uuid.v4()
        return resolve(game)
      })
    },
    joinGame: (user, gameId) => {
      return new Promise((resolve) => {
        collection.findOne({ _id: ObjectId(gameId) }, (err, game) => {
          if (!game.users.some((elem) => user.refUser === elem.refUser)) {
            const couleursPrises = game.users.map((u) => u.avatar)
            const couleurRestantes = listColor.filter(
              (b) =>
                !couleursPrises
                  .map((a) => comparison(a, b))
                  .some((e) => e === false)
            )
            user.avatar =
              couleurRestantes[
                Math.floor(Math.random() * couleurRestantes.length)
              ]
            collection.findOneAndUpdate(
              { _id: ObjectId(gameId) },
              { $push: { users: user } },
              (err, status) => {
                collection.findOne({ _id: ObjectId(gameId) }, (err, game) => {
                  return resolve(game)
                })
              }
            )
          } else {
            return resolve(game)
          }
        })
      })
    },
    getResultTile: (game) => {
      return new Promise((resolve) => {
        const newWords = {}
        game.words.forEach((ligne) => ligne.forEach((w) => (newWords[w] = 0)))
        const res = game.votes.reduce((acc, vote) => {
          acc[vote.tile.word] += 1
          return acc
        }, newWords)
        const [word] = Object.keys(res).filter(
          (key) => res[key] === game.turnPlayers.length
        )
        const [tile] = game.maps
          .map((ligne) => ligne.filter((t) => t.word === word)[0])
          .filter((e) => e)
        tile.returned = true
        game.maps = game.maps.map((ligne) =>
          ligne.map((t) => (t.word === tile.word ? tile : t))
        )
        game.votes = game.votes.filter((v) => v.tile.word !== word)
        switch (tile.color) {
          case "#0074A0":
            game.scoreBlueTeam--
            if (game.turn.team == "red") game.endOfTurn = true
            break
          case "#B81E22":
            game.scoreRedTeam--
            if (game.turn.team == "blue") game.endOfTurn = true
            break
          case "#C7B793":
            game.endOfTurn = true
          case "#413D3A":
            game.blackTile = true
            break
        }
        game.numberAnswer++
        if (game.numberAnswer === game.indice.number + 1) game.endOfTurn = true
        if (game.blackTile) {
          game.turn.team === "blue"
            ? (game.scoreBlueTeam = 0)
            : (game.scoreRedTeam = 0)
          game.endOfGame = true
          game.gameWinners.push(game.turn.team === "blue" ? "red" : "blue")
        }

        if (game.scoreBlueTeam == 0 || game.scoreRedTeam == 0) {
          game.endOfGame = true
          game.gameWinners.push(game.turn.team)
        }
        if (game.endOfTurn) {
          game.indice = {}
          game.numberAnswer = 0
          game.turn =
            game.turn.team === "blue"
              ? { type: "spy", team: "red" }
              : { type: "spy", team: "blue" }
          game.turnPlayers =
            game.turn.team === "blue"
              ? [
                  game.guesser.blueTeam[
                    game.guesserIndex //% game.guesser.blueTeam.length
                  ],
                ]
              : [
                  game.guesser.redTeam[
                    game.guesserIndex //% game.guesser.redTeam.length
                  ],
                ]
        }
        resolve(game)
      })
    },
    receivedIndice: (game) => {
      return new Promise((resolve) => {
        game.turnPlayers =
          game.turn.team === "blue"
            ? game.blueTeam.filter(
                (u) =>
                  u.refUser !==
                  game.guesser.blueTeam[
                    game.guesserIndex % game.guesser.blueTeam.length
                  ].refUser
              )
            : game.redTeam.filter(
                (u) =>
                  u.refUser !==
                  game.guesser.redTeam[
                    game.guesserIndex % game.guesser.redTeam.length
                  ].refUser
              )
        game.turn =
          game.turn.team === "blue"
            ? { type: "qg", team: "blue" }
            : { type: "qg", team: "red" }
        resolve(game)
      })
    },
  }
}
chunk = (array, size) => {
  const chunkedArr = []
  const copied = [...array]
  const numOfChild = Math.ceil(copied.length / size)
  for (let i = 0; i < numOfChild; i += 1) {
    chunkedArr.push(copied.splice(0, size))
  }
  return chunkedArr
}
chunkTeams = (array) => {
  const copied = [...array]
  const numOfChild = Math.ceil(copied.length / 2)
  const blueTeam = copied.splice(0, numOfChild)
  return [blueTeam, copied]
}

module.exports = games
