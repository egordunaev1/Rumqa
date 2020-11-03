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
    this.frontend = 'http://localhost:3000';
    this.state = {
      ws: null,
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

  timeout = 250;

  get_nm_height = () => Math.min(this.new_message.current.scrollHeight, this.state.height - 181 - 50 - 100);

  componentDidUpdate(a, b, c) {
    if (this.get_nm_height() !== this.state.nm_height)
      this.setState({ nm_height: this.get_nm_height() });
  }

  connect = () => {
    var ws = new WebSocket("ws://194.58.102.76:8000/ws/room_chat/" + this.props.room.id + '/');
    let that = this; // cache the this
    var connectInterval;

    // websocket onopen event listener
    ws.onopen = () => {
      console.log("connected websocket main component");

      this.setState({ ws: ws });

      that.timeout = 250; // reset timer to 250 on open of websocket connection 
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    };

    // websocket onclose event listener
    ws.onclose = e => {
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (that.timeout + that.timeout) / 1000
        )} second.`,
        e.reason
      );

      that.timeout = that.timeout + that.timeout; //increment retry interval
      connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
    };

    ws.onmessage = e => {
      console.log(e);
      const data = JSON.parse(e.data);
      const message = data.message;
      console.log(message);
      var mes = this.state.messages;
      mes.push(message);
      this.setState({ messages: mes });
    };

    // websocket onerror event listener
    ws.onerror = err => {
      console.error(
        "Socket encountered error: ",
        err.message,
        "Closing socket"
      );

      ws.close();
    };
  };

  check = () => {
    const { ws } = this.state;
    if (!ws || ws.readyState == WebSocket.CLOSED) this.connect(); //check if websocket instance is closed, if so call `connect` function.
  };

  componentDidMount() {
    this.getMessages();
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    this.connect();
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

  getMessages = () => {
    var token = getCookie('token');
    var headers = (token ? { Authorization: `JWT ${token}` } : {});
    if (this.state.mm)
      fetch(this.backend + '/more_messages/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          room: this.props.room.id,
          part: (this.state.messages.length / 10 | 0) + 1
        })
      }).then(res => {
        if (res.status === 200)
          res.json().then(res => {
            let messages = this.state.messages;
            messages = res.concat(messages);
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
