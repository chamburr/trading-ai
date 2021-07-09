import React from 'react';
import './styles.css';
import init from './script.js';

import alert from './assets/alert.png';
import dashboard from './assets/dashboard.png';
import predict from './assets/predict.png';
import settings from './assets/settings.png';

class SideBar extends React.Component {
  componentDidMount() {
    init();
  }

  render() {
    return (
      <div id="sidebar">
        <a className="d-block sidebar-button" id="nav-dashboard">
          Dashboard
          <img src={dashboard}/>
        </a>
        <hr/>
        <a className="d-block sidebar-button" id="nav-alert-me">
          Alert Me
          <img src={alert}/>
        </a>
        <hr/>
        <a className="d-block sidebar-button" id="nav-predict">
          Predict
          <img src={predict}/>
        </a>
        <hr/>
        <a className="d-block sidebar-button" id="nav-settings">
          Settings
          <img src={settings}/>
        </a>
        <hr/>
      </div>
    );
  }
}

export default SideBar;
