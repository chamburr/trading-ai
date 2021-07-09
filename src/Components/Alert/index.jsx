import React from 'react';
import './styles.css';
import init from './script.js';

class Alert extends React.Component {
  componentDidMount() {
    init();
  }

  render() {
    return (
      <div className="alert alert-success alert-dismissible fade show" role="alert">
        {this.props.msg}
        <button type="button" id="alert-close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden={true}>&times;</span>
        </button>
      </div>
    );
  }
}

export default Alert;
