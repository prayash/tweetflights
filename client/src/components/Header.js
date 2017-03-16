import React, { Component } from 'react';
import '../css/header.css';
import twitterLogo from '../../assets/twitter_logo.png';

class Header extends Component {
  render() {
    return (
      <div id='header'>
        <img className='twitter-logo' src={twitterLogo} alt='twitter logo'/>
        <h1 className='title'>a bit of big data</h1>
      </div>
    );
  }
}

export default Header;
