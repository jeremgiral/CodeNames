import React from "react"
import { connect } from "react-redux"
import { Redirect } from "react-router-dom"

export default ChildComponent => {
  const RequireAuth = () => {
    switch (this.props.auth.role) {
      case "admin":
        return <ChildComponent {...this.props} />
      default:
        return <Redirect to="/notfound" />
    }
  }

  function mapStateToProps({ auth }) {
    return { auth }
  }

  return connect(mapStateToProps)(RequireAuth)
}
