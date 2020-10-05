import React from 'react';
import {
  Redirect
} from "react-router-dom";

class Reg extends React.Component {
  state = {
    username: '',
    username_err: '',
    password: '',
    password_err: '',
    width: window.innerWidth
  };

  handle_change = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState(prevstate => {
      const newState = { ...prevstate };
      newState[name] = value;
      return newState;
    });
  };

  full_match = (str, template) => {
    let match = str.match(template);
    return (match && match.pop() === str);
  }

  username_validation = (username) => {
    if (!username)
      return 'Введите логин';
    if (username.length < 8)
      return 'Логин должен быть не короче 8 символов';
    if (!this.full_match(username, /[A-Za-z0-9._-]+/))
      return 'Логин должен содержать символы латинского алфавита, цифры или знаки ".", "_", "-"';
    return '';
  }

  password_validation = (password, password_rep) => {
    if (!password)
      return 'Введите пароль';
    if (!password_rep)
      return 'Повторите пароль';
    if (password !== password_rep)
      return 'Пароли не совпадают';
    if (password.length < 8)
      return 'Пароль должен быть не короче 8 символов';
    if (!this.full_match(password, /[A-Za-z0-9._-]+/))
      return 'Пароль должен содержать символы латинского алфавита, цифры или знаки ".", "_", "-"';
    return '';
  }

  handle_signup = (e, data) => {
    e.preventDefault();
    let username_err = this.username_validation(data.username);
    let password_err = this.password_validation(data.password, data.repeat_password);
    if (username_err || password_err)
      this.setState({ username_err: username_err, password_err: password_err });
    else {
      fetch('http://localhost:8000/create_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(res => {
          if (res.status < 200 || res.status > 300) {
            console.log(123);
            res.json().then(r => {
              let state = this.state;
              this.setState({
                password_err: r.password && r.password.length ? r.password[0] : state.password_err,
                username_err: r.username && r.username.length ? r.username[0] : state.username_err
              })
            }
            );
          }
          else
            res.json()
              .then(json => localStorage.setItem('token', json.token))
              .then(() => this.props.updateUser());
        })

    }
  }

  render() {
    {
      if (!this.props.logged_in)
        return (
          <div className="profile-body body bg-white p-3">
            <form onSubmit={e => this.handle_signup(e, this.state)}>
              <h4 className="d-flex justify-content-center text-primary">Добро пожаловать в Roomqa!</h4>
              <div>
                <label htmlFor="username">Логин</label>
                <input type="text" className="form-control" name="username" value={this.state.username} onChange={this.handle_change} placeholder="Логин" id="username" />
                <div className="reg_form_err">{this.state.username_err}</div>
              </div>
              <div className="mt-3">
                <label htmlFor="password">Пароль</label>
                <input type="password" className="form-control" name="password" value={this.state.password} onChange={this.handle_change} placeholder="Пароль" id="password" />
                <div className="reg_form_err">{this.state.password_err}</div>
              </div>
              <div className="mt-3">
                <label htmlFor="repeat_password">Повторите пароль</label>
                <input type="password" className="form-control" name="repeat_password" value={this.state.repeat_password} onChange={this.handle_change} placeholder="Повторите пароль" id="repeat_password" />
              </div>
              <button
                className="mt-3 btn btn-success"
                type="submit">
                Зарегистрироваться
          </button>
            </form>
          </div >
        );
      else return (<Redirect to="/Main" />);
    }
  }
}


export default Reg;