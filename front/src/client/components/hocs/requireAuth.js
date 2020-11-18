import React, { Component } from "react"
import { connect } from "react-redux"
import { Redirect } from "react-router-dom"
import { fetchCurrentUser, sendSocket } from "../../actions"
import Loading from "../Loading"
import SocketContext from "../../socket"

export default ChildComponent => {
  class RequireAuth extends Component {
    state = {
      loading: false
    }

    componentWillMount() {
      this.setState({ loading: true })
      try {
        this.props.fetchCurrentUser().then(() => {
          if (this.props.auth.user) console.log(this.props.auth.user.socketId !== this.props.socket.id)
          if (this.props.auth.user && this.props.auth.user.socketId !== this.props.socket.id) {
            this.props.sendSocket(this.props.socket, this.props.auth.user)
          }
          this.setState({ loading: false })
        })
      } catch (error) {
        this.setState({ loading: false })
      }
    }
    render() {
      if (!this.state.loading) {
        switch (this.props.auth.status) {
          case false:
            console.log("redirect to login")
            // return <ChildComponent {...this.props} />
            return <Redirect to="/login" />
          case null:
            // return <ChildComponent {...this.props} />
            return <Loading />
          default:
            return <ChildComponent {...this.props} />
        }
      } else {
        // return <ChildComponent {...this.props} />
        return <Loading />
      }
    }
  }

  function mapStateToProps({ auth }) {
    return { auth }
  }
  const RequireAuthWithSocket = props => <SocketContext.Consumer>{socket => <RequireAuth {...props} socket={socket} />}</SocketContext.Consumer>

  return connect(mapStateToProps, { fetchCurrentUser, sendSocket })(RequireAuthWithSocket)
}
