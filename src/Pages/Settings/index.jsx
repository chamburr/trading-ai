import React from 'react';
import $ from 'jquery';
import './styles.css';
import init from './script.js';

class Settings extends React.Component {
  constructor() {
    super();
    $('#page-heading').text('Settings');
  }

  componentDidMount() {
    init();
  }

  render() {
    return (
      <div className="row">
        <div className="col-6 page-col">
          <h4 className="page-sub-heading"><span id="settings-app-name"></span> v<span id="settings-app-version"></span></h4>
          <p>Your stock trading companion, powered by AI.<br/></p>
          <p>This app can help you with trading stocks. You can view stock prices and indicators, set alerts when the prices rise or fall, and use our prediction algorithm to get the forecast price. Trading has never been this easy!<br/></p>
          <p>The project is fully open source on GitHub. You can view the source code and contribute to this app!<br/></p>
          <button className="btn btn-primary page-button" id="settings-visit-website" type="button">Visit Website</button>
          <button className="btn btn-success page-button" id="settings-check-updates" type="button">Check for Updates</button>
        </div>
        <div className="col-6 page-col">
          <h4 className="page-sub-heading">License</h4>
          <textarea className="form-control" id="settings-terms" spellCheck="false" readOnly={true}></textarea>
        </div>
      </div>
    );
  }
}

export default Settings;
