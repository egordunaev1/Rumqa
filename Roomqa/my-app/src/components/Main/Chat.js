import React, { Component, createRef } from 'react';
import BrowseMessages from './BrowseMessages';
import { getCookie } from '../../cookieOperations';
import Scrollbar from 'react-scrollbars-custom';
import CreateMessage from './CreateMessage';

function TopPanel(props) {
  return (
    <div className="container-fluid bg-primary p-1 border-rounded-top chat-top-panel">
    </div>
  )
}

class Chat extends Component {
  constructor(props) {
    super(props);
    this.code = {};
    this.style = {};
    this.lang = {};
    this.backend = 'http://194.58.102.76:8000';
    this.frontend = 'http://194.58.102.76:3000';
    this.state = {
      nm_height: 140,
      height: 0,
      messages: [],
      mm: true,
      struct: [
        {
          type: 'text',
          value: ''
        }
      ]
    };
  }

  scrollbar = React.createRef();
  new_message = React.createRef();
  timerId;
  timeout = 250;

  get_nm_height = () => Math.min(this.new_message.current.scrollHeight, this.state.height - 181 - 50 - 100);

  componentDidUpdate(a, b, c) {
    if (this.get_nm_height() !== this.state.nm_height)
      this.setState({ nm_height: this.get_nm_height() });
  }


  componentDidMount() {
    this.getMessages();
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    this.timerId = setInterval(() => this.getMessages(false), 3000);
    if (this.new_message.current)
      this.new_message.current.addEventListener('resize', this.update_nm_height);
  }


  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ height: window.innerHeight });
  }

  sendMessage = () => {
    this.state.ws.send(JSON.stringify({
      message: this.state.struct
    }));
    this.setState({ struct: [{ type: 'text', value: '' }] });
  }

  getMessages = (last = true) => {
    var message;
    if (this.state.messages.length == 0)
      message = -1;
    else {
      if (last)
        message = this.state.messages[this.state.messages.length - 1].id;
      else
        message = this.state.messages[0].id;
    }
    var token = getCookie('token');
    var headers = (token ? { Authorization: `JWT ${token}` } : {});
    if (this.state.mm)
      fetch(this.backend + '/more_messages/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          room: this.props.room.id,
          last_message: message,
          last: last
        })
      }).then(res => {
        if (res.status === 200)
          res.json().then(res => {
            let messages = this.state.messages;
            if (last)
              messages = res.concat(messages);
            else messages = messages.concat(res);
            let mm = res.length && res.length % 10 === 0;
            this.setState({ messages: messages, mm: mm });
          });
        else {
          if (res.status !== 400) {
            if (res.status === 401)
              alert('Необходима авторизация');
            else
              this.props.setError(res.status);

          }
        }
      })
  }

  scrollbot = 0;

  render() {
    var strh = 'calc(' + this.state.nm_height + 'px' + ' + .5rem)';
    return (
      <div className="body main-body bg-white">
        <TopPanel />
        <div className="chat d-flex flex-column" style={{ height: (this.state.height - 181 - 50) + 'px' }}>
          <Scrollbar
            onLoad={() => { var s = this.scrollbar.current; s.scrollTop = s.scrollHeight - this.scrollbot; }}
            onScrollStop={(s) => {
              !s.scrollTop && this.getMessages();
            }}
            onScroll={(s) => {
              this.scrollbot = s.scrollHeight - s.scrollTop;
            }}
            elementRef={(instance) => (instance && (this.scrollbar.current = instance.firstChild.firstChild))}
            style={{ height: this.state.height - 181 - 50 - this.state.nm_height }}>
            <BrowseMessages user={this.props.user} messages={this.state.messages} />
          </Scrollbar>
          <Scrollbar style={{ height: strh, width: '100%', borderTop: '2px solid #cdd1d5' }}>
            <div className="new-message mt-auto container-fluid p-2" ref={this.new_message}>
              {this.props.user ? <CreateMessage setStruct={(struct) => this.setState({ struct: struct })} struct={this.state.struct} backend={this.backend} frontend={this.frontend} sendMessage={this.sendMessage} /> : ''}
            </div>
          </Scrollbar>
        </div>
      </div>
    )
  }
}

export default Chat;
