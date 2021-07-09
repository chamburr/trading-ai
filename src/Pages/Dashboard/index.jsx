import React from 'react';
import $ from 'jquery';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './styles.css';
import init from './script.js';
import { showAlert } from '../../utils/functions.js';
import { searchStock } from '../../utils/stockapi.js';

class Dashboard extends React.Component {
  constructor() {
    super();
    $('#page-heading').text('Dashboard');

    this.state = {
      loading: false,
      options: []
    }
  }

  componentDidMount() {
    init();
  }

  render() {
    return (
      <div className="row">
        <div className="col-6 page-col">
          <div className="input-group form-group">
            <AsyncTypeahead
              isLoading={this.state.loading}
              id="dashboard-search-stock"
              placeholder="Search or add a stock"
              minLength={1}
              delay={30}
              useCache={false}
              onSearch={query => {
                this.setState({loading: true});
                searchStock(query).then(res => {
                  let results = []
                  res.forEach(element => {
                      results.push(`${element['simple_name'] || element['name']} (${element['symbol']})`)
                  });
                  this.setState({
                    loading: false,
                    options: results
                  });
                }).catch(err => showAlert(err.message));
              }}
              options={this.state.options}
            />
            <div className="input-group-append">
              <button className="btn btn-primary" id="dashboard-add-stock" type="button">Add</button>
            </div>
          </div>
          <div id="dashboard-stock-list"></div>
        </div>
        <div className="col-6 page-col">
          <div className="form-group">
            <label id="dashboard-label-type">Type:</label>
            <select className="custom-select" id="dashboard-select-type" defaultValue="price">
              <option value="price">Stock Price</option>
              <option value="indicator">Indicator</option>
            </select>
          </div>
          <div className="form-group">
            <label id="dashboard-label-specific">Duration:</label>
            <select className="custom-select" id="dashboard-select-specific" defaultValue="1d">
              <option value="1d">1 Day</option>
              <option value="5d">5 Days</option>
              <option value="1mo">1 Month</option>
              <option value="3mo">3 Months</option>
              <option value="6mo">6 Months</option>
              <option value="1y">1 Year</option>
              <option value="2y">2 Years</option>
              <option value="5y">5 Years</option>
            </select>
          </div>
          <div id="dashboard-graph-container">
            <canvas id="dashboard-graph"></canvas>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
