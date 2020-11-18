import { GET_RANDOM_WORDS } from "../actions"

const defaultState = {
  list: [],
  current: {
    word: ""
  }
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_RANDOM_WORDS:
      return {
        ...state,
        current: action.payload.data
      }
    default:
      return state
  }
}
