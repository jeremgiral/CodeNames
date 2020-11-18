import { FETCH_CURRENT_USER, AUTHENTICATE_USER, ERROR_AUTHENTICATE_USER, CREATE_USER, ERROR_CREATE_USER, DISCONNECT_USER } from "../actions"

const defaultState = {
  status: false
}

export default (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_CURRENT_USER:
      return {
        ...state,
        user: action.payload.data,
        status: true
      }
    case DISCONNECT_USER:
      return {
        ...state,
        user: null,
        status: false
      }
    case AUTHENTICATE_USER:
      localStorage.setItem("token", action.payload.data.token)
      return {
        ...state,
        status: true
      }
    case ERROR_AUTHENTICATE_USER:
      return {
        ...state,
        status: false,
        token: null
      }
    case CREATE_USER:
      localStorage.setItem("token", action.payload.data.token)
      return {
        ...state,
        status: true
      }
    case ERROR_CREATE_USER:
      return {
        ...state,
        status: false,
        token: null
      }
    default:
      return state
  }
}
