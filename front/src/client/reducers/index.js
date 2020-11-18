import { combineReducers } from "redux"
import gamesReducer from "./gamesReducer"
import authReducer from "./authReducer"
import wordsReducer from "./wordsReducer"
import mapsReducer from "./mapsReducer"

export default combineReducers({
  games: gamesReducer,
  auth: authReducer,
  words: wordsReducer,
  maps: mapsReducer
})
