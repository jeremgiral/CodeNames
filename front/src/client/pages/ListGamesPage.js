import { Table, Button, Icon, Tooltip, Row, Col, Divider } from "antd"
import { connect } from "react-redux"
import React, { Component } from "react"
import { Helmet } from "react-helmet"
import { Redirect } from "react-router-dom"
import SocketContext from "../socket"

import { fetchAllGames, joinGame, createGame, createdGame, updatedGame } from "../actions"

class ListGamesPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      hasError: false,
      joined: false,
      redirect: false
    }
  }

  componentDidMount() {
    this.props.fetchAllGames().then(() => this.setState({ loading: false }))
    this.props.socket.on("sendNewGame", res => {
      this.props.createdGame(res)
    })
    this.props.socket.on("updatedGame", res => {
      this.props.updatedGame(res)
      if (res.users.some(elem => this.props.auth.user.refUser === elem.refUser)) {
        this.setState({ joined: res._id })
      }
    })
  }
  componentWillUnmount() {
    this.props.socket.off("sendNewGame")
    this.props.socket.off("updatedGame")
  }
  getData = () => this.props.games.list

  componentDidCatch() {
    this.setState({ hasError: true })
  }
  handleClickCreateGame = () => {
    console.log(this.props.socket, this.props.auth.user)
    this.props.createGame(this.props.socket, this.props.auth.user)
    // this.socket.emit("newGame", this.props.auth.user)
  }
  handleClickJoinGame = refGame => {
    this.props.joinGame(this.props.socket, refGame, this.props.auth.user)
    // this.socket.emit("newGame", this.props.auth.user)
  }

  head = () => <Helmet>{<title>Liste des Parties</title>}</Helmet>

  renderRedirect = () => this.state.redirect && <Redirect to={`/game/${this.state.redirect}`} />

  render() {
    const columns = [
      {
        title: "Date de la partie",
        dataIndex: "date"
      },
      {
        title: "Joueurs",
        dataIndex: "users",
        key: "users",
        // eslint-disable-next-line no-nested-ternary
        render: users => users.map((user, i) => (i + 1 === users.length ? user.nomUser : i + 2 === users.length ? `${user.nomUser} et ` : `${user.nomUser},`))
      },
      { title: "Statut", dataIndex: "status", key: "status" },
      {
        title: <p style={{ textAlign: "center" }}>Action</p>,
        key: "action",
        render: record => (
          <div>
            <Row type="flex" justify="center">
              <Col span={6}>
                <Tooltip placement="top" title="Rejoindre la partie">
                  <Button
                    type="default"
                    onClick={() => {
                      this.handleClickJoinGame(record._id)
                    }}
                  >
                    <Icon type="user-add" /> Rejoindre la partie
                  </Button>
                </Tooltip>
              </Col>
            </Row>
          </div>
        )
      }
    ]
    return this.state.joined ? (
      <Redirect to={`/game/${this.state.joined}`} />
    ) : (
      <div>
        {this.renderRedirect()}
        {this.head()}
        <Row>
          <Col>
            <h1 style={{ textAlign: "center" }}>Liste des Parties</h1>
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col span={12}>
            <Divider />
          </Col>
        </Row>
        <Row type="flex" justify="end" style={{ marginBottom: 12 }}>
          <Col>
            <Button type="primary" onClick={() => this.handleClickCreateGame()}>
              <Icon type="plus" />
              Créer une partie
            </Button>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {this.state.hasError ? (
              <h2> Une erreur est survenue</h2>
            ) : (
              <Table
                loading={this.state.loading}
                rowKey={record => record._id}
                columns={columns}
                dataSource={this.getData()}
                onRow={record => ({
                  onClick: () => {
                    this.setState({ redirect: record._id })
                  }
                })}
              />
            )}
          </Col>
        </Row>
      </div>
    )
  }
}

function mapStateToProps(games) {
  return games
}
const ListGamesPageWithSocket = props => <SocketContext.Consumer>{socket => <ListGamesPage {...props} socket={socket} />}</SocketContext.Consumer>
export default {
  component: connect(mapStateToProps, {
    fetchAllGames,
    joinGame,
    createGame,
    createdGame,
    updatedGame
  })(ListGamesPageWithSocket)
}
