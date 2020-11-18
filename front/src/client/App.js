import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { renderRoutes } from "react-router-config"
import { Layout, Menu, Icon, Button } from "antd"
import { fetchCurrentUser, disconnectUser } from "./actions"
import requireAuth from "./components/hocs/requireAuth"

const { Content, Footer, Header } = Layout

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { current: "home" }
  }

  handleClick = e => {
    this.setState({
      current: e.key
    })
  }
  render() {
    return (
      <Layout className="layout">
        <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
          {/* <div className="logo" /> */}
          <Menu theme="light" onClick={this.handleClick} selectedKeys={[this.state.current]} mode="horizontal" style={{ lineHeight: "64px" }}>
            <Menu.Item key="home">
              <Link to="/" href="/">
                <Icon type="home" />
                Home
              </Link>
            </Menu.Item>
            <Menu.Item style={{ float: "right" }}>{this.props.auth.user.nomUser}</Menu.Item>
            <Menu.Item style={{ float: "right" }}>
              <Link to="/login" href="/login">
                <Button
                  type="light"
                  onClick={() => {
                    this.props.disconnectUser()
                    // this.props.history.go("/login")
                    localStorage.removeItem("token")
                  }}
                >
                  Déconnexion
                </Button>
              </Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ marginTop: 64, minHeight: "100vh" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>{renderRoutes(this.props.route.routes)}</div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Code Names 2020 Created by Jérémy Giral</Footer>
      </Layout>
    )
  }
}

function mapStateToProps({ auth }) {
  return { auth }
}

export default {
  component: connect(mapStateToProps, { fetchCurrentUser, disconnectUser })(requireAuth(App))
}
