import React, { Component } from 'react'
import '../css/header.css'
import twitterLogo from '../../assets/twitter_logo.png'

class Header extends Component {
  render() {
    return (
      <div id='header'>
        <img className='twitter-logo' src={twitterLogo} alt='twitter logo'/>
        {/*<h1 className='title'>A &#39;bit&#39; of Big Data</h1>*/}
        <h1 className='title'>TweetFlights</h1>
      </div>
    );
  }
}

export default Header
