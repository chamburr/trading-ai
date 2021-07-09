import React from 'react';
import $ from 'jquery';
import './styles.css';
import init from './script.js';

class AlertMe extends React.Component {
  constructor() {
    super()
    $('#page-heading').text('Alert Me');
  }

  componentDidMount() {
    init();
  }

	render() {
		return (
      <div className="row">
        <div className="col page-col">
          <div id="alert-me-alert-manage">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Target Price</th>
                    <th>Auto Renew</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="alert-me-alert-list"></tbody>
              </table>
            </div>
          </div>
          <h4 className="page-sub-heading">Add Alert</h4>
          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label>Select Stock:</label>
                <select className="custom-select" id="alert-me-select-stock" defaultValue="">
                  <option value="" disabled={true}>---</option>
                </select>
              </div>
              <div className="input-group alert-margin">
                <div className="input-group-prepend">
                  <span className="input-group-text">Current Value</span>
                </div>
                <input type="text" className="form-control" id="alert-me-current-value" placeholder="$0.00" readOnly={true}/>
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label>Target Stock Price:</label>
                <a className="badge badge-pill badge-primary badge-tooltip" data-toggle="tooltip" data-placement="top" title="This is the price you want to set the alert to watch for.">?</a>
                <input type="text" className="form-control" id="alert-me-target-value"/>
              </div>
              <div className="custom-control custom-switch alert-margin">
                <input type="checkbox" className="custom-control-input" id="alert-me-auto-renew"/>
                <a className="badge badge-pill badge-primary badge-tooltip" data-toggle="tooltip" data-placement="top" title="This sets your alert to renew with a new target price with +2/-2 depending on the direction.">?</a>
                <label className="custom-control-label" htmlFor="alert-me-auto-renew">Auto-Renew Alert</label>
              </div>
              <button type="button" className="btn btn-success page-button" id="alert-me-set-alert">Set Alert</button>
            </div>
          </div>
        </div>
      </div>
    );
	}
}

export default AlertMe;
