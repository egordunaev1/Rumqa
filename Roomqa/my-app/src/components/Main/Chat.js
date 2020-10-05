import React, { Component, createRef } from 'react';
import BrowseMessages from './BrowseMessages';
import Interweave from 'interweave';
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
    this.backend = 'http://localhost:8000';
    this.frontend = 'http://localhost:3000';
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

  get_nm_height = () => Math.min(this.new_message.current.scrollHeight, this.state.height - 181 - 50 - 100);

  componentDidUpdate(a, b, c) {
    if (this.get_nm_height() !== this.state.nm_height)
      this.setState({ nm_height: this.get_nm_height() });
  }

  componentDidMount() {
    this.getMessages();
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
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
    fetch(this.backend + '/send_message/', {
      method: 'POST',
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        room: this.props.room.id,
        struct: this.state.struct,
        type: 'message'
      })
    }).then(res => {
      if (res.status === 200) {
        this.setState({ struct: [{ type: 'text', value: '' }] });
        res.json().then(res => {
          var mes = this.state.messages;
          mes.push(res);
          this.setState({ messages: mes });
        });
      } else {
        if (res.status !== 400) {
          if (res.status === 401)
            alert('Необходима авторизация');
          else
            this.props.setError(res.status);
        }
      }
    })
  }

  getMessages = () => {
    var headers = (localStorage.getItem('token') ? { Authorization: `JWT ${localStorage.getItem('token')}` } : {});
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
              <CreateMessage setStruct={(struct) => this.setState({ struct: struct })} struct={this.state.struct} backend={this.backend} frontend={this.frontend} sendMessage={this.sendMessage} />
            </div>
          </Scrollbar>
        </div>
      </div>
    )
  }
}

export default Chat;