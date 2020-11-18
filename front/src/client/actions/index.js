// API

export const FETCH_ALL_GAMES = "fetch_all_games"
export const fetchAllGames = () => async (dispatch, getState, api) => {
  const res = await api.get("/games")
  dispatch({
    type: FETCH_ALL_GAMES,
    payload: res
  })
}

export const FETCH_GAME = "fetch_game"
export const fetchGame = refGamme => async (dispatch, getState, api) => {
  const res = await api.get(`/games/${refGamme}`)
  dispatch({
    type: FETCH_GAME,
    payload: res
  })
}

export const AUTHENTICATE_USER = "authenticate_user"
export const ERROR_AUTHENTICATE_USER = "error_authenticate_user"
export const authenticateUser = (values, socket) => async (dispatch, getState, api) => {
  try {
    const res = await api.post("/auth/login", values)
    dispatch({
      type: AUTHENTICATE_USER,
      payload: res
    })
    const { user, password } = values
    socket.emit("authentication", { user, password })
    return null
  } catch (error) {
    dispatch({
      type: ERROR_AUTHENTICATE_USER,
      payload: false
    })
    return error.response.data
  }
}

export const DISCONNECT_USER = "disconnect_user"
export const disconnectUser = () => async dispatch => {
  dispatch({
    type: DISCONNECT_USER,
    payload: null
  })
  return null
}

export const CREATE_USER = "create_user"
export const ERROR_CREATE_USER = "error_create_user"
export const createUser = values => async (dispatch, getState, api) => {
  try {
    const res = await api.post("/users", values)
    dispatch({ type: CREATE_USER, payload: res })
    return null
  } catch (error) {
    dispatch({
      type: ERROR_CREATE_USER,
      payload: false
    })
    return error.response.data
  }
}

export const SEND_SOCKET = "send_socket"
export const sendSocket = (socket, user) => () => {
  socket.emit("socket", user)
}

export const FETCH_CURRENT_USER = "fetch_current_user"
export const fetchCurrentUser = () => async (dispatch, getState, api) => {
  try {
    const res = await api.get("/users/current")
    dispatch({
      type: FETCH_CURRENT_USER,
      payload: res
    })
  } catch (error) {
    console.log("error fetching current client")
  }
}

// Socket

export const CREATE_GAME = "create_game"
export const createGame = (socket, user) => () => {
  socket.emit("newGame", user)
}

export const CREATED_GAME = "created_game"
export const createdGame = data => async dispatch => {
  dispatch({
    type: CREATED_GAME,
    payload: data
  })
}

export const JOIN_GAME = "join_game"
export const joinGame = (socket, refGame, user) => () => {
  console.log({ refGame, user })
  socket.emit("joinGame", { refGame, user })
}

export const UPDATED_GAME = "updated_game"
export const updatedGame = data => async dispatch => {
  dispatch({
    type: UPDATED_GAME,
    payload: data
  })
}

export const UPDATE_GAME = "update_game"
export const updateGame = (socket, game) => () => {
  socket.emit("updateGame", { game })
}

export const START_GAME = "start_game"
export const startGame = (socket, data) => async () => {
  socket.emit("startGame", data)
}

export const UPDATED_CURRENT_GAME = "updated_current_game"
export const updatedCurrentGame = data => async dispatch => {
  dispatch({
    type: UPDATED_GAME,
    payload: data
  })
}

export const GET_RANDOM_MAP = "get_random_map"
export const getRandomMap = () => async (dispatch, getState, api) => {
  const res = await api.get("/map")
  dispatch({
    type: GET_RANDOM_MAP,
    payload: res
  })
}

export const PLAY_TILE = "play_tile"
export const playTile = (socket, game) => async () => {
  socket.emit("playTile", game)
}

export const SEND_INDICE = "send_indice"
export const sendIndice = (socket, game) => async () => {
  socket.emit("sendIndice", game)
}

export const END_TURN = "end_turn"
export const endTurn = (socket, game) => async () => {
  socket.emit("endTurn", game)
}
