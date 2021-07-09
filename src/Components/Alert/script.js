import ReactDOM from 'react-dom';
import $ from 'jquery';

function init() {
    $('#alert-close').click(() => ReactDOM.unmountComponentAtNode(document.getElementById('alert-container')));
}

export default init;
