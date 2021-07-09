import React from 'react';
import $ from 'jquery';
import './styles.css';
import init from './script.js'

class Predict extends React.Component {
  constructor() {
    super();
    $('#page-heading').html('Predict');
  }

  componentDidMount() {
    init();
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-6 page-col pb-0">
            <div className="form-group">
              <label>Select Stock:</label>
              <select className="custom-select" id="predict-select-stock" defaultValue="">
                <option value="" disabled={true}>---</option>
              </select>
            </div>
            <button className="btn btn-success page-button" id="predict-training-button" type="button">Start Training</button>
          </div>
          <div className="col-6 page-col pb-0">
            <div className="form-group">
              <label>Epochs:</label>
              <a className="badge badge-pill badge-primary badge-tooltip" data-toggle="tooltip" data-placement="top" title="In machine learning, an epoch is feeding a batch of data to digest and evaluate. In short, the more epochs, the more accurate the result, but a longer time will be taken.">?</a>
              <input type="text" className="form-control" id="predict-epochs" placeholder="15"/>
            </div>
            <div className="form-group">
              <label>Learning Rate:</label>
              <a className="badge badge-pill badge-primary badge-tooltip" data-toggle="tooltip" data-placement="top" title="This is how much the program should estimate the errors in calculation to create a more accurate representation. The learning rate is a value between 0 and 1. Try various values if you are unsure or use the default.">?</a>
              <input type="text" className="form-control" id="predict-learning-rate" placeholder="0.005"/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col page-col pt-0">
            <div className="input-group alert-margin" id="predict-forecast-price-container">
              <div className="input-group-prepend">
                <span className="input-group-text">Forecast Price</span>
              </div>
              <input className="form-control" id="predict-forecast-price" type="text" placeholder="$0.00" readOnly={true}/>
            </div>
            <div id="predict-graph-container">
              <canvas id="predict-graph"></canvas>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Predict;
