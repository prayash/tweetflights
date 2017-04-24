import React, { Component } from 'react';

import Header from './Header';
import Globe from './Globe';

class Application extends Component {

  toggleDetails = () => {
    
  }

  render() {
    return (
      <div id='container'>
        <Header />
        <Globe />
        <div id='controls'>
          <h3>Controls</h3>
          <ul className="tg-list">
            <li className="tg-list-item">
              <input className="tgl tgl-skewed" id="cb1" type="checkbox"/>
              <label className="tgl-btn" data-tg-off="OFF" data-tg-on="ON" htmlFor="cb1" onClick={this.toggleDetails()}></label>
              <h4>Details</h4>
            </li>

            {/*<li className="tg-list-item">
              <input className="tgl tgl-skewed" id="cb2" type="checkbox"/>
              <label className="tgl-btn" data-tg-off="OFF" data-tg-on="ON" htmlFor="cb2"></label>
              <h4>Locations</h4>
            </li>*/}
          </ul>
        </div>
      </div>
    );
  }
}

export default Application;
