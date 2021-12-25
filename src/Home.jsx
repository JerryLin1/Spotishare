import React from "react";

import logo from "./Images/Logo.png";

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.setState({});
  }

  render() {
    return (
      <div>
        <h1 id="title">SpotiShare</h1>

        <div id="searchArea">
          <input
            id="searchbox"
            type="text"
            placeholder="Type the name of the song!"
          />
        <button id="search-btn">Search!</button>
        </div>
      </div>
    );
  }
}
