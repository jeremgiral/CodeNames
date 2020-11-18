import React, { Component } from "react"
import { Helmet } from "react-helmet"
import { connect } from "react-redux"
import { Form, Icon, Input, Button, Layout, Row, Col } from "antd"
import { Link, Redirect } from "react-router-dom"
import { createUser, authenticateUser } from "../actions"
import SocketContext from "../socket"

const { Content } = Layout
const FormItem = Form.Item

class Signin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      message: ""
    }
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      this.setState({ isLoading: true })
      if (!err) {
        this.props.createUser(values).then(() => {
          this.props.authenticateUser(values, this.props.socket).then(() => {
            this.setState({
              isLoading: false
            })
          })
        })
      }
    })
  }

  hasErrors = fieldsError => Object.keys(fieldsError).some(field => fieldsError[field])

  head = () => (
    <Helmet>
      <title>Sign In</title>
      <meta property="og:title" content="Signin" />
    </Helmet>
  )

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form

    const userNameError = isFieldTouched("user") && getFieldError("user")
    const passwordError = isFieldTouched("password") && getFieldError("password")
    return this.props.auth.status === false ? (
      <Layout>
        {this.head()}
        <Content>
          <Row type="flex" justify="center" align="middle" style={{ minHeight: "100vh" }}>
            <Col span={8}>
              {/* <img alt="logo" src="public/img/logo-small.png" style={{ width: "100%" }} /> */}
              <h1>Inscrivez vous !</h1>
              {this.state.message.length !== 0 && (
                <div className="info-login" align="middle">
                  {this.state.message}
                </div>
              )}
              <Form layout="vertical" onSubmit={this.handleSubmit}>
                <FormItem validateStatus={userNameError ? "error" : ""} help={userNameError || ""}>
                  {getFieldDecorator("user", {
                    rules: [
                      {
                        required: true,
                        message: "Vous devez entrer votre nom"
                      }
                    ]
                  })(<Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="Username" />)}
                </FormItem>
                <FormItem validateStatus={passwordError ? "error" : ""} help={passwordError || ""}>
                  {getFieldDecorator("password", {
                    rules: [
                      {
                        required: true,
                        message: "Il manque votre mot de passe :("
                      }
                    ]
                  })(<Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="Password" />)}
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit" disabled={this.hasErrors(getFieldsError()) || this.state.isLoading}>
                    {this.state.isLoading ? <Icon type="save" /> : "Inscription"}
                  </Button>
                  <Button type="info">
                    <Link to="/login" href="/login" type="info">
                      <Icon type="login" />
                      Se connecter
                    </Link>
                  </Button>
                </FormItem>
              </Form>
            </Col>
          </Row>
        </Content>
      </Layout>
    ) : (
      !this.state.isLoading && <Redirect to="/" />
    )
  }
}

const WrappedSignin = Form.create()(Signin)

function mapStateToProps(state) {
  return { auth: state.auth }
}
const WrappedSigninWithSocket = props => <SocketContext.Consumer>{socket => <WrappedSignin {...props} socket={socket} />}</SocketContext.Consumer>

export default {
  component: connect(mapStateToProps, { createUser, authenticateUser })(WrappedSigninWithSocket)
}
