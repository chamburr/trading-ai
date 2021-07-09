import React from 'react';
import './styles.css';

class MainContainer extends React.Component {
  render() {
    return (
      <div className="container page-container">
        <div id="alert-container"></div>
        <h2 id="page-heading">Loading...</h2>
        <div id="page-row">
        </div>
      </div>
    );
  }
}

export default MainContainer;
