import { Card, Button, notification, Form, Row, Col, Select, Switch, InputNumber, TimePicker, Radio, Avatar, Icon, Input, Typography, Popconfirm, Modal } from "antd"
import { connect } from "react-redux"
import React, { Component } from "react"
import { Helmet } from "react-helmet"
import SocketContext from "../socket"

import { fetchGame, startGame, updatedGame, updateGame, playTile, sendIndice, endTurn } from "../actions"

import moment from "moment"

const { Title } = Typography
const FormItem = Form.Item

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
class GamePage extends Component {
  constructor(props) {
    super(props)
    this.state = { indice: { indice: "", number: 0 } }
  }
  componentDidMount() {
    this.props.fetchGame(this.props.match.params.refGame)
    this.props.socket.on("updatedGame", res => {
      this.props.updatedGame(res)
    })
  }

  componentWillUnmount() {
    this.props.socket.off("updatedGame")
  }

  getData = () => this.props.games.current

  handleClickTiles = (tile, isPopConfirm) => {
    const { current } = this.props.games
    if (
      current.votes.filter(v => v.tile.word === tile.word).length < current.turnPlayers.length - 1 ||
      (isPopConfirm && current.votes.filter(v => v.tile.word === tile.word).length === current.turnPlayers.length - 1)
    ) {
      const [userWithColor] = this.props.games.current.users.filter(u => u.refUser === this.props.auth.user.refUser)
      if (userWithColor.refUser !== current.guesser.blueTeam[current.guesserIndex].refUser && userWithColor.refUser !== current.guesser.redTeam[current.guesserIndex].refUser) {
        console.log(current.votes.filter(v => v.user.refUser === userWithColor.refUser && v.tile.word === tile.word))
        if (current.votes.filter(v => v.user.refUser === userWithColor.refUser && v.tile.word === tile.word).length > 0) {
          current.votes = current.votes.filter(v => v.user.refUser !== userWithColor.refUser && v.tile.word === tile.word)
        } else {
          current.votes.push({ user: userWithColor, tile })
          const isTurn = current.turnPlayers.some(elem => this.props.auth.user.refUser === elem.refUser)
          if (current.votes.filter(v => v.tile.word === tile.word && current.turnPlayers.some(u => u.refUser === v.user.refUser)).length === current.turnPlayers.length && isTurn) {
            this.props.playTile(this.props.socket, current)
            // this.props.updateGame(this.props.socket, current)
          } else {
            this.props.updateGame(this.props.socket, current)
          }
        }
      }
    }
  }
  handleClickStartGame = () => {
    if (this.props.games.current.odd && this.props.games.current.users.length % 2 === 1) {
      notification.error({
        message: "Erreur lors du lancement de la partie",
        description: "Le nombre de joueur présent n'est pas pair."
      })
    } else if (this.props.games.current.users.length < 4) {
      notification.error({
        message: "Erreur lors du lancement de la partie",
        description: "Le nombre de joueur doit être au minimum de 4."
      })
    } else {
      this.props.startGame(this.props.socket, this.props.games.current)
    }
  }

  handleBlueTeamChoice = value => {
    const [userId] = value
    let { current } = this.props.games
    const { redTeam } = current
    if (redTeam.length > 0 && redTeam.filter(u => u.refUser === userId).length > 0) {
      const [user] = redTeam.splice(Math.max(redTeam.map((u, i) => (u.refUser === userId ? i : 0))), 1)
      const blueTeam = [...current.blueTeam, user]
      current = { ...current, redTeam, blueTeam }
    } else {
      const [user] = current.users.filter(u => u.refUser === userId)
      const blueTeam = [...current.blueTeam, user]
      current = { ...current, blueTeam }
    }
    this.props.updateGame(this.props.socket, current)
  }

  handleRedTeamChoice = value => {
    const [userId] = value
    let { current } = this.props.games
    const { blueTeam } = current
    if (blueTeam.length > 0 && blueTeam.filter(u => u.refUser === userId).length > 0) {
      const [user] = blueTeam.splice(Math.max(blueTeam.map((u, i) => (u.refUser === userId ? i : 0))), 1)
      const redTeam = [...current.redTeam, user]
      current = { ...current, redTeam, blueTeam }
    } else {
      const [user] = current.users.filter(u => u.refUser === userId)
      const redTeam = [...current.redTeam, user]
      current = { ...current, redTeam }
    }
    this.props.updateGame(this.props.socket, current)
  }

  head = () => <Helmet>{<title>Liste des Parties</title>}</Helmet>

  modalLayout = () => {
    const { current } = this.props.games
    return (
      <Modal
        title="Fin de la mène"
        onOk={this.props.startGame(this.props.socket, this.props.games.current)}
        onCancel={this.props.endOfGame(this.props.socket, this.props.games.current)}
        okText="Nouvelle mène 💪"
        cancelText="Fin de la partie 😴"
      >
        <p>{`Victoire de l'équipe ${current.gameWinners[current.gameWinners.length - 1] === "blue" ? "Bleu" : "Rouge"} `}</p>
        <p>
          <span img="🔷" /> Equipe Bleu : {current.gameWinners.filter(t => t === "blue").length} mène{current.gameWinners.filter(t => t === "blue").length > 1 ? "s" : ""}
        </p>
        <p>
          <span img="🟥" /> Equipe Rouge : {current.gameWinners.filter(t => t === "red").length} mène{current.gameWinners.filter(t => t === "red").length > 1 ? "s" : ""}
        </p>
      </Modal>
    )
  }

  tilesLayout = () => {
    const { current } = this.props.games
    const isTurn = current.turnPlayers && current.turnPlayers.some(elem => this.props.auth.user.refUser === elem.refUser)
    let isGuesser = false
    if (current.guesser) {
      if (current.blueTeam.some(elem => this.props.auth.user.refUser === elem.refUser)) {
        isGuesser = current.guesser.blueTeam[current.guesserIndex].refUser === this.props.auth.user.refUser
      } else {
        isGuesser = current.guesser.redTeam[current.guesserIndex].refUser === this.props.auth.user.refUser
      }
    }
    return current.words && current.words.length > 0 ? (
      <Row justify="center">
        {current.maps.map(chunk => (
          <Row type="flex" justify="center" span={4}>
            {chunk.map(tile => (
              <Col span={4}>
                <Popconfirm
                  title="Ce vote amenera l'unanimité sur ce mot et il sera choisi, êtes-vous sûr ?"
                  onConfirm={() => this.handleClickTiles(tile, true)}
                  onCancel={null}
                  okText="Oui"
                  cancelText="Non"
                  disabled={
                    !current.users.some(u => u.refUser === this.props.auth.user.refUser) ||
                    current.votes.filter(v => v.tile.word === tile.word && current.turnPlayers.some(u => u.refUser === v.user.refUser)).length !== current.turnPlayers.length - 1 ||
                    isGuesser
                  }
                >
                  <Card
                    title={tile.word}
                    bordered
                    hoverable
                    headStyle={{
                      textAlign: "center",
                      color: isGuesser || tile.returned ? "#fff" : "#000",
                      backgroundColor: isGuesser || tile.returned ? tile.color : "white"
                    }}
                    bodyStyle={{ display: "none" }}
                    onClick={() => {
                      if (!isGuesser && current.users.some(u => u.refUser === this.props.auth.user.refUser)) {
                        this.handleClickTiles(tile)
                      }
                    }}
                    extra={[
                      current.votes.map(
                        v =>
                          v.tile.word === tile.word && (
                            <Avatar style={{ backgroundColor: v.user.avatar, verticalAlign: "top", horizontalAlign: "right" }} size="small">
                              {v.user.nomUser[0]}
                            </Avatar>
                          )
                      ),
                      tile.returned && isGuesser && <Avatar style={{ color: "#1ec71e", backgroundColor: "#90ee90" }} icon={<Icon type="checked" />} />
                    ]}
                  />
                </Popconfirm>
              </Col>
            ))}
          </Row>
        ))}
      </Row>
    ) : null
  }
  formLayout = () => (
    <Row>
      <Form {...layout}>
        <FormItem>
          <FormItem name="input-number" label="Nombre maximal de joueurs" noStyle>
            <InputNumber min={4} value={this.props.games.current.numberPlayers} onChange={value => this.props.updateGame(this.props.socket, { ...this.props.games.current, numberPlayers: value })} />
          </FormItem>
        </FormItem>
        <FormItem name="odd" label="Nombre de joueur pair uniquement" valuePropName="checked">
          <Switch onChange={() => this.props.updateGame(this.props.socket, { ...this.props.games.current, odd: !this.props.games.current.odd })} checked={this.props.games.current.odd} />
        </FormItem>
        <FormItem name="join" label="Des joueurs peuvent rejoindre la partie en cours" valuePropName="checked">
          <Switch
            onChange={() => this.props.updateGame(this.props.socket, { ...this.props.games.current, isJoignable: !this.props.games.current.isJoignable })}
            checked={this.props.games.current.isJoignable}
          />
        </FormItem>
        <FormItem name="time" label="TimePicker">
          <TimePicker
            value={moment(this.props.games.current.timer, "mm:ss")}
            format="mm:ss"
            onChange={e => this.props.updateGame(this.props.socket, { ...this.props.games.current, timer: e.target.value })}
          />
        </FormItem>
        <FormItem name="timeTrigger" label="Déclenchement du temps">
          <Radio.Group>
            <Radio.Button
              value="auto"
              checked={this.props.games.current.triggerTimerMode === "auto"}
              onClick={() => this.props.updateGame(this.props.socket, { ...this.props.games.current, triggerTimerMode: "auto" })}
            >
              Automatique
            </Radio.Button>
            <Radio.Button
              value="manual"
              checked={this.props.games.current.triggerTimerMode === "manual"}
              onClick={() => this.props.updateGame(this.props.socket, { ...this.props.games.current, triggerTimerMode: "manual" })}
            >
              Manuel
            </Radio.Button>
          </Radio.Group>
        </FormItem>
        <FormItem name="teamCompMode" label="Composition des équipes">
          <Radio.Group>
            <Radio.Button
              value="auto"
              checked={this.props.games.current.teamCompMode === "auto"}
              onClick={() => this.props.updateGame(this.props.socket, { ...this.props.games.current, teamCompMode: "auto" })}
            >
              Automatique
            </Radio.Button>
            <Radio.Button
              value="manual"
              checked={this.props.games.current.teamCompMode === "manual"}
              onClick={() => this.props.updateGame(this.props.socket, { ...this.props.games.current, teamCompMode: "manual" })}
            >
              Manuel
            </Radio.Button>
          </Radio.Group>
        </FormItem>

        {/* {this.props.games.current.teamCompMode === "manual" && this.dragDropUsersLayout()} */}
        <FormItem style={{ display: this.props.games.current.teamCompMode === "auto" ? "none" : "block" }} label="Equipe Bleu">
          <Select mode="multiple" onChange={this.handleblueTeamChoice} disabled={this.props.games.current.teamCompMode === "auto"} value={this.props.games.current.blueTeam.map(u => u.nomUser)}>
            {this.props.games.current.users.map(user => <Select.Option value={user.refUser}>{user.nomUser}</Select.Option>)}
          </Select>
        </FormItem>
        <FormItem style={{ display: this.props.games.current.teamCompMode === "auto" ? "none" : "block" }} label="Equipe Rouge">
          <Select mode="multiple" onChange={this.handleredTeamChoice} disabled={this.props.games.current.teamCompMode === "auto"} value={this.props.games.current.redTeam.map(u => u.nomUser)}>
            {this.props.games.current.users.map(user => <Select.Option value={user.refUser}>{user.nomUser}</Select.Option>)}
          </Select>
        </FormItem>
        <FormItem>
          <Button onClick={() => this.handleClickStartGame()}>Commencer la partie</Button>
        </FormItem>
      </Form>
    </Row>
  )

  render() {
    let isGuesser = false
    const { current } = this.props.games
    if (current.guesser) {
      if (current.blueTeam.some(elem => this.props.auth.user.refUser === elem.refUser)) {
        isGuesser = current.guesser.blueTeam[current.guesserIndex].refUser === this.props.auth.user.refUser
      } else {
        isGuesser = current.guesser.redTeam[current.guesserIndex].refUser === this.props.auth.user.refUser
      }
    }
    const isTurn = current.turnPlayers && current.turnPlayers.some(elem => this.props.auth.user.refUser === elem.refUser)
    return (
      <div>
        {this.head()}
        {current.endOfGame && this.modalLayout()}
        {current.status === "En attente de joueurs" && <h1>{current.status}</h1>}
        {current.status === "En attente de joueurs" ? (
          <Row>
            {current.users.map(user => (
              <Row>
                <Col span={4}>
                  <Avatar style={{ backgroundColor: user.avatar, verticalAlign: "middle" }} size="large">
                    {user.nomUser[0]}
                  </Avatar>
                </Col>
                <Col span={12}>
                  <Title level={4}>{user.nomUser}</Title>
                </Col>
              </Row>
            ))}
          </Row>
        ) : null}
        {current.status === "En cours" && (
          <Row>
            <Row align="middle">
              <Title level={4}>
                Equipe Bleu {current.scoreBlueTeam} : {current.scoreRedTeam} Equipe Rouge
              </Title>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Card title="Equipe Bleu" bordered headStyle={{ backgroundColor: "#0074A0", color: "#fff" }}>
                  <Card title="Espion">
                    <Row align="middle">
                      <Col span={4}>
                        <Avatar style={{ backgroundColor: current.guesser.blueTeam[current.guesserIndex].avatar, verticalAlign: "middle" }} size="large">
                          {current.guesser.blueTeam[current.guesserIndex].nomUser[0]}
                        </Avatar>{" "}
                      </Col>
                      <Col span={12}>
                        <Title level={4}>{current.guesser.blueTeam[current.guesserIndex].nomUser}</Title>
                      </Col>
                    </Row>
                  </Card>
                  <Card title="Quartier Général">
                    {current.blueTeam.map(
                      u =>
                        u.refUser !== current.guesser.blueTeam[current.guesserIndex].refUser && (
                          <Row align="middle">
                            <Col span={4}>
                              <Avatar style={{ backgroundColor: u.avatar, verticalAlign: "middle" }} size="large">
                                {u.nomUser[0]}
                              </Avatar>
                            </Col>
                            <Col span={12}>
                              <Title level={4}>{u.nomUser}</Title>
                            </Col>
                          </Row>
                        )
                    )}
                  </Card>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Equipe Rouge" bordered headStyle={{ backgroundColor: "#B81E22", color: "#fff" }}>
                  <Card title="Espion">
                    <Row align="middle">
                      <Col span={4}>
                        <Avatar style={{ backgroundColor: current.guesser.redTeam[current.guesserIndex].avatar, verticalAlign: "middle" }} size="large">
                          {current.guesser.redTeam[current.guesserIndex].nomUser[0]}
                        </Avatar>{" "}
                      </Col>
                      <Col span={12}>
                        <Title level={4}>{current.guesser.redTeam[current.guesserIndex].nomUser}</Title>
                      </Col>
                    </Row>
                  </Card>
                  <Card title="Quartier Général">
                    {current.redTeam.map(
                      u =>
                        u.refUser !== current.guesser.redTeam[current.guesserIndex].refUser && (
                          <Row align="middle">
                            <Col span={4}>
                              <Avatar style={{ backgroundColor: u.avatar, verticalAlign: "middle" }} size="large">
                                {u.nomUser[0]}
                              </Avatar>
                            </Col>
                            <Col span={12}>
                              <Title level={4}>{u.nomUser}</Title>
                            </Col>
                          </Row>
                        )
                    )}
                  </Card>
                </Card>
              </Col>
            </Row>
          </Row>
        )}
        {current.turn && (
          <Title level={3}>
            C'est au tour {current.turn.type === "spy" ? "de l'espion" : "du Quartier Général"} de l'équipe {current.turn.team === "red" ? "Rouge" : "Bleu"} de jouer.
          </Title>
        )}
        {current.indice && (
          <Col>
            <Row>
              <Title level={4}>Indice : {current.indice.indice}</Title>
            </Row>
            <Row>
              <Title level={4}>Nombre de mots à trouver : {current.indice.number}</Title>
            </Row>

            {isTurn &&
              !isGuesser && (
                <FormItem>
                  <Button type="primary" onClick={() => this.props.endTurn(this.props.socket, current)}>
                    Mettre fin au tour
                  </Button>
                </FormItem>
              )}
          </Col>
        )}
        {isGuesser &&
          isTurn && (
            <Row>
              <FormItem label="Indice">
                <Input
                  prefix={<Icon type="bulb" style={{ fontSize: 13 }} />}
                  placeholder="Indice"
                  value={this.state.indice.indice}
                  onChange={e => this.setState({ indice: { number: this.state.indice.number, indice: e.target.value } })}
                />
                <InputNumber min={0} max={9} value={this.state.indice.number} onChange={value => this.setState({ indice: { indice: this.state.indice.indice, number: value } })} />
                <Button type="primary" onClick={() => this.props.sendIndice(this.props.socket, { ...current, indice: this.state.indice })}>
                  Envoyer
                </Button>
              </FormItem>
            </Row>
          )}
        {this.props.games.current.status === "En attente de joueurs" && this.formLayout()}
        {this.tilesLayout()}
      </div>
    )
  }
}

function mapStateToProps(games) {
  return games
}
const GamePageWithSocket = props => <SocketContext.Consumer>{socket => <GamePage {...props} socket={socket} />}</SocketContext.Consumer>

export default {
  component: connect(mapStateToProps, {
    fetchGame,
    startGame,
    updatedGame,
    updateGame,
    playTile,
    sendIndice,
    endTurn
  })(GamePageWithSocket)
}
