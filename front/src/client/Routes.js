import App from "./App"
import NotFoundPage from "./pages/NotFoundPage"
import GamePage from "./pages/GamePage"
import ListGamesPage from "./pages/ListGamesPage"
import LoginPage from "./pages/LoginPage"
import SignInPage from "./pages/SignInPage"

export default [
  {
    ...LoginPage,
    path: "/login",
    exact: true
  },
  {
    ...SignInPage,
    path: "/signin",
    exact: true
  },
  {
    ...App,
    routes: [
      {
        ...ListGamesPage,
        path: "/",
        exact: true
      },
      {
        ...GamePage,
        path: "/game/:refGame",
        exact: true
      },
      {
        ...NotFoundPage
      }
    ]
  }
]
