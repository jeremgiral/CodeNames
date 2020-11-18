import { FETCH_ALL_GAMES, FETCH_GAME, CREATED_GAME, UPDATED_GAME, UPDATED_CURRENT_GAME } from "../actions"

const defaultState = {
  list: [],
  current: {
    game: {}
  }
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_ALL_GAMES:
      return {
        ...state,
        list: action.payload.data
      }
    case FETCH_GAME:
      return {
        ...state,
        current: action.payload.data
      }
    case CREATED_GAME:
      return {
        ...state,
        list: [...state.list, action.payload]
      }
    case UPDATED_GAME:
      return {
        ...state,
        list: state.list.map(game => (action.payload._id === game._id ? action.payload : game)),
        current: action.payload
      }
    case UPDATED_CURRENT_GAME:
      return {
        ...state,
        current: action.payload
      }

    default:
      return state
  }
}
