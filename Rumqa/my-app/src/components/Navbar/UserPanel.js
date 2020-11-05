import React from 'react';
import LoginForm from './LoginForm';
import {
  Link
} from "react-router-dom";
import { getBackend } from '../../utility';

class UserPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hidden: true }
    this.handleProfileHidden = this.handleProfileHidden.bind(this);
  }
  wrapper = React.createRef();

  componentWillUnmount() {
    this.removeOutsideClickListener();
  }

  addOutsideClickListener() {
    document.addEventListener('click', this.handleDocumentClick);
  }

  removeOutsideClickListener() {
    document.removeEventListener('click', this.handleDocumentClick);
  }

  onShow() {
    this.addOutsideClickListener();
  }

  onHide() {
    this.removeOutsideClickListener();
  }

  onClickOutside() {
    this.setState({ hidden: true });
  }

  handleDocumentClick = e => {
    if (this.wrapper.current && !this.wrapper.current.contains(e.target)) {
      this.onClickOutside();
    }
  };

  handleProfileHidden() {
    let hidden = this.state.hidden;
    !hidden ? this.onHide() : this.onShow();
    this.setState({ hidden: !hidden });
  }

  render() {
    if (this.props.logged_in)
      return (
        <div id="navbar-profile-panel" ref={this.wrapper} className="d-flex">
          <div>ПРИВА</div>
          <div onClick={this.handleProfileHidden} id="logged-in-nav-panel">
            <div className="my-auto" id="navbar-username">{this.props.user.username}</div>
            <img alt=""  className="my-auto cover-img"  src={getBackend() + this.props.user.profile.cover} height="32px" width="32px" />
          </div>
          <div className={this.state.hidden ? 'hidden' : ''} id="nav-profile">
            <Link to={'/profile/' + this.props.user.id} className="nav-profile-item" id="nav-profile-name" onClick={() => this.props.update_pat(1)}>
              <img alt=""  className="my-auto cover-img"  src={getBackend() + this.props.user.profile.cover} height="32px" width="32px" />
              <div className="">{this.props.user.profile.first_name + ' ' + this.props.user.profile.last_name}</div>
            </Link>
            <div className="nav-profile-sep mx-auto" />
            <Link to={'/'} className="nav-profile-item">Мои комнаты</Link>
            <Link to={'/profile/' + this.props.user.id + '/friends'} className="nav-profile-item" onClick={() => this.props.update_pat(2)}>Друзья</Link>
            <Link to={'/profile/' + this.props.user.id + '/edit'} className="nav-profile-item" onClick={() => this.props.update_pat(3)}>Редактировать</Link>
            <div className="nav-profile-sep mx-auto" />
            <Link to="/Main" className="nav-profile-item" onClick={() => { this.handleProfileHidden(); this.props.handle_logout(); }} >Выйти</Link>
          </div>
        </div>
      )
    else
      return (
        <div id="navbar-login-panel">
          <LoginForm
            handle_login={this.props.handle_login}
            isActive={this.props.isActive}
          />
        </div>
      )
  }
}

export default UserPanel;