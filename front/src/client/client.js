// Startup point for the client side application
import "babel-polyfill"
import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter } from "react-router-dom"
import { createStore, applyMiddleware, compose } from "redux"
import thunk from "redux-thunk"
import { Provider } from "react-redux"
import { renderRoutes } from "react-router-config"
import axios from "axios"
import Routes from "./Routes"
import reducers from "./reducers"
import SocketContext from "./socket"
import * as io from "socket.io-client"

// We create here a custom instance of axios for client side calls
const axiosInstance = axios.create({
  baseURL: "http://77.196.174.51:3000/",
  headers: {
    Authorization: {
      toString() {
        return `Bearer ${localStorage.getItem("token")}`
      }
    }
  }
})

const store = createStore(reducers, {}, compose(applyMiddleware(thunk.withExtraArgument(axiosInstance)), window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f))
const socket = io.connect("http://77.196.174.51:3000", {
  // extraHeaders: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  query: `token=${localStorage.getItem("token")}`
})
socket.on("unauthorized", error => {
  // if (error.data.type === "UnauthorizedError" || error.data.code === "invalid_token") {
  // redirect user to login page perhaps?
  console.log("User token has expired", error)
  // }
})
ReactDOM.hydrate(
  <SocketContext.Provider value={socket}>
    <Provider store={store}>
      <BrowserRouter>
        <div>{renderRoutes(Routes)}</div>
      </BrowserRouter>
    </Provider>{" "}
  </SocketContext.Provider>,
  document.querySelector("#root")
)
