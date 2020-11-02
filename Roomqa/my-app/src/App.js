import React, { Component } from 'react';
import Navbar from './components/Navbar/Nav';
import Profile from './components/Profile/Profile';
import Reg from './components/Profile/Reg';
import Main from './components/Main/Main';
import MyRooms from './components/Main/MyRooms';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { getCookie, deleteCookie, setCookie } from './cookieOperations';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logged_in: false,
      user: null,
      profile_active_tab: 1
    };
    this.backend = 'http://194.58.102.76:8000';
    this.frontend = 'http://localhost:3000';
    this.updateUserData = this.updateUserData.bind(this);
    this.update_pat = this.update_pat.bind(this);
  }

  update_pat(num) {
    this.setState({profile_active_tab: num});
  }

  updateUserData() {
    let logged_in = getCookie('token') ? true : false;
    if (this.state.logged_in || logged_in) {
      fetch(this.backend + '/current-user/', {
        headers: {
          Authorization: `JWT ${getCookie('token')}`
        }
      })
        .then(response => {
          if (response.status !== 200) {
            deleteCookie('token');
            this.setState({ logged_in: false, user: null});
          }
          else {
            response.json()
              .then(res => this.setState({
                user: res,
                logged_in: true
              }));
          }
        }
        )
    }
  }

  componentDidMount() {
    this.updateUserData();
  }

  handle_login = (e, data) => {
    e.preventDefault();
    fetch(this.backend+'/token-auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(json => {setCookie('token', json.token, {'max-age': 2592000, 'samesite': 'Lax'}); console.log(json.token);})
      .then(() => this.updateUserData());
  };

  handle_logout = () => {
    deleteCookie('token');
    this.setState({ logged_in: false, user: null });
  };


  render() {
    return (
      <Router>
        <div className="App">
          <Navbar
            logged_in={this.state.logged_in}
            handle_login={this.handle_login}
            user={this.state.user}
            handle_logout={this.handle_logout}
            update_pat={this.update_pat} />
          <Switch>
            <Route exact path="/registration" render={(props) => <Reg {...props} updateUser={this.updateUserData} handle_signup={this.handle_signup} logged_in={this.state.logged_in}/>} />
            <Route path="/profile/:id?" render={(props) => <Profile {...props} user={this.state.user} updateUser={this.updateUserData} update_pat={this.update_pat} active_tab={this.state.profile_active_tab} />} />
            <Route exact path="/" render={(props) => <MyRooms {...props} user={this.state.user} />} />
            <Route path="/" render={(props) => <Main {...props} user={this.state.user} updateUser={this.updateUserData} />} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;