const games = require("./games")
const users = require("./users")

const connect = db => {
  return {
    games: games(db),
    users: users(db)
  }
}

module.exports = { connect }
