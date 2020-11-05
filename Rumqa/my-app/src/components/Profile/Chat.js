import React, { Component } from 'react';
import { getCookie } from '../../cookieOperations';
import { getBackend } from '../../utility';
import Chat from '../Main/Chat';
import Wrapper from '../Main/Wrapper';

class PrivateChat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chat_id: null,
      is_loading: true,
      error: null
    }
  }

  componentDidMount() {
    this.get_personal_chat();
  }

  get_personal_chat = () => {
    var interlocutor;
    try {
      interlocutor = Number.parseInt(this.props.match.params.user_id);
    } catch (err) {
      this.setState({ error: 404 });
      return;
    }
    fetch(getBackend() + '/private_chat/' + interlocutor, {
      method: 'GET',
      headers: {
        Authorization: `JWT ${getCookie('token')}`
      }
    }).then(res => {
      if (res.status === 200) 
        res.json().then((json) => {console.log(json); this.setState({ chat_id: json, is_loading: false })});
      else this.setError(res.status);
    })
  }

  setError = (err_code) => {
    this.setState({ error: err_code });
  }

  render() {
    return (
      <Wrapper is_loading={this.state.is_loading} error={this.state.error}>
        <Chat user={this.props.user} chat={this.state.chat_id} setError={this.setError} />
      </Wrapper>
    )
  }
}

export default PrivateChat;