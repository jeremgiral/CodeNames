const users = (db) => {
  const collection = db.collection("users")
  const gamesCol = db.collection("games")

  return {
    updateSocket: (user, socketId) => {
      return new Promise((resolve, reject) => {
        new Promise((resolve, reject) => {
          user.socketId = socketId
          collection.updateOne(
            { refUser: user.refUser },
            { $set: { socketId: socketId } },
            (err, state) => {
              if (err) reject(new Error("Set SocketId user error"))
              gamesCol
                .find({ "users.refUser": user.refUser })
                .toArray((err, games) => {
                  games.forEach((game) => {
                    game.users = game.users.map((u) =>
                      u.refUser === user.refUser ? { ...u, socketId } : u
                    )
                    if (game.blueTeam) {
                      game.blueTeam = game.blueTeam.map((u) =>
                        u.refUser === user.refUser ? { ...u, socketId } : u
                      )
                    }
                    if (game.redTeam) {
                      game.redTeam = game.redTeam.map((u) =>
                        u.refUser === user.refUser ? { ...u, socketId } : u
                      )
                    }
                    if (game.guesser) {
                      game.guesser.blueTeam = game.guesser.blueTeam.map((u) =>
                        u.refUser === user.refUser ? { ...u, socketId } : u
                      )
                      game.guesser.redTeam = game.guesser.redTeam.map((u) =>
                        u.refUser === user.refUser ? { ...u, socketId } : u
                      )
                    }
                    gamesCol.updateOne(
                      { _id: game._id },
                      { game },
                      (err, state) => {
                        console.log(game._id + " updated")
                      }
                    )
                  })
                  resolve(err, games)
                })
            }
          )
        }).then((games) => {
          resolve(user, games)
        })
      })
    },
    getUserByName: (name) => {
      return new Promise((resolve, reject) => {
        const projection = { _id: 0 }
        const sendUser = (err, user, games) => {
          if (err) {
            reject(
              new Error(`An error occured while fetching user with err: ${err}`)
            )
          }
          resolve(user, games)
        }
        collection.findOne({ nomUser: name }, { projection }, (err, user) => {
          sendUser(err, user)
        })
      })
    },
    createUser: (user) => {
      return new Promise((resolve, reject) => {
        const fetchUser = (err, createdUser) => {
          if (err) {
            return reject(
              new Error(
                `An error occured while creating user with id: ${createdUser.refUser}`
              )
            )
          }
          if (createdUser.length < 1) {
            return reject(
              new Error(
                `An error occured while creating user with id: ${createdUser.refUser}`
              )
            )
          }

          resolve(createdUser.ops[0])
        }

        collection.insertOne(
          {
            refUser: user.refUser,
            nomUser: user.user,
            actif: true,
            password: user.hashedPassword,
          },
          (err, user) => {
            fetchUser(err, user)
          }
        )
      })
    },
  }
}

module.exports = users
