import React, { Component } from "react"
import { Helmet } from "react-helmet"
import { connect } from "react-redux"
import { Form, Icon, Input, Button, Layout, Row, Col } from "antd"
import { Link, Redirect } from "react-router-dom"
import { fetchCurrentUser, authenticateUser } from "../actions"
import SocketContext from "../socket"

const { Content } = Layout
const FormItem = Form.Item
const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}

class Login extends Component {
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
        this.props.authenticateUser(values, this.props.socket).then(() => {
          this.setState({
            isLoading: false
          })
        })
      }
    })
  }

  hasErrors = fieldsError => Object.keys(fieldsError).some(field => fieldsError[field])

  head = () => (
    <Helmet>
      <title>Login</title>
      <meta property="og:title" content="Login" />
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
              <h1>Connectez vous !</h1>
              {this.state.message.length !== 0 && (
                <div className="info-login" align="middle">
                  {this.state.message}
                </div>
              )}
              <Form {...layout} onSubmit={this.handleSubmit}>
                <FormItem validateStatus={userNameError ? "user" : ""} help={userNameError || ""}>
                  {getFieldDecorator("user", {
                    rules: [
                      {
                        required: true,
                        message: "Vous devez entrer votre username"
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
                <FormItem wrapperCol={{ offset: 8, span: 16 }}>
                  <Button type="info">
                    <Link to="/signin" href="/signin" type="save">
                      <Icon type="save" />
                      {"S'inscrire"}
                    </Link>
                  </Button>
                  <Button type="primary" htmlType="submit" disabled={this.hasErrors(getFieldsError()) || this.state.isLoading}>
                    {this.state.isLoading ? <Icon type="loading" /> : "Connexion"}
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

const WrappedLogin = Form.create()(Login)

function mapStateToProps(state) {
  return { auth: state.auth }
}
const WrappedLoginWithSocket = props => <SocketContext.Consumer>{socket => <WrappedLogin {...props} socket={socket} />}</SocketContext.Consumer>

export default {
  component: connect(mapStateToProps, { fetchCurrentUser, authenticateUser })(WrappedLoginWithSocket)
}
