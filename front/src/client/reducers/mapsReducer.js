import { GET_RANDOM_MAP } from "../actions"

const defaultState = {
  list: [],
  current: {
    card: ""
  }
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case GET_RANDOM_MAP:
      return {
        ...state,
        current: action.payload.data
      }
    default:
      return state
  }
}
