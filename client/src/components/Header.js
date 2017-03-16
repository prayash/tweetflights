import React, { Component } from 'react';
import '../css/header.css';
import twitterLogo from '../../assets/Twitter_Logo_Blue.png';

class Header extends Component {
  render() {
    return (
      <div id='header'>
        <img className='twitter-logo' src={twitterLogo} />
        <h1 className='title'>a bit of big data</h1>
      </div>
    );
  }
}

export default Header;
