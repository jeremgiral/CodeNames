const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")
model = module.exports = {
  model: model => {
    passport.use(
      new LocalStrategy(
        {
          usernameField: "user",
          passwordField: "password"
        },
        (name, password, cb) => {
          model.users.getUserByName(name).then(user => {
            if (!user)
              return cb(null, false, {
                message: "Cet utilisateur n'existe pas"
              })

            const userCopy = user
            return bcrypt.compare(password, userCopy.password, (err, res) => {
              delete userCopy.password
              if (res)
                return cb(null, userCopy, { message: "Logged In Successfully" })
              return cb(null, false, { message: "Mauvais mot de passe" })
            })
          })
        }
      )
    )
  },
  initpassport: (model, JWTSettings) => {
    passport.use(
      new JWTStrategy(
        {
          jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
          secretOrKey: JWTSettings.secret
        },
        function(jwtPayload, cb) {
          return model.users
            .getUserByName(jwtPayload.nomUser)
            .then(user => {
              return cb(null, user)
            })
            .catch(err => {
              return cb(err)
            })
        }
      )
    )
  }
}
const passport = require("passport")
const passportJWT = require("passport-jwt")
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
