import React, { Component } from 'react'

import Header from './Header'
import Globe from './Globe'

class Application extends Component {

  constructor(props) {
    super(props);
    this.state = { details: true };
  }

  toggleDetails = () => {
    this.setState({
      details: !this.state.details
    })
  }

  render() {

    return (
      <div id='container'>
        <Header />
        <Globe details={this.state.details} />
        <div id='controls'>
          <h3>Controls</h3>
          <ul className="tg-list">
            <li className="tg-list-item">
              <input className="tgl tgl-skewed" id="cb1" type="checkbox" checked={this.state.details} onChange={this.toggleDetails} />
              <label className="tgl-btn" data-tg-off="OFF" data-tg-on="ON" htmlFor="cb1"></label>
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
    )
  }
}

export default Application
