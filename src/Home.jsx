
import React from "react";

import { Row, Col } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      members: ["Royeek", "Yom", "Yerry"],
      songs: null,
    };

    this.client = this.props.client;
  }

  renderMembers() {
    return (
      <div>
        {this.state.members.map((member, key) => {
          if (member === "Royeek") {
            return (
              <div className="member-card" key={key}>
                {member}{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={36}
                  height={20}
                  viewBox="0 0 512 512"
                  fill="gold"
                >
                  <path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 149.5 0 176s21.5 48 48 48c2.6 0 5.2-.4 7.7-.8L128 416h384l72.3-192.8c2.5.4 5.1.8 7.7.8 26.5 0 48-21.5 48-48s-21.5-48-48-48z" />
                </svg>
              </div>
            );
          }
          return (
            <div className="member-card" key={key}>
              {member}
            </div>
          );
        })}
      </div>
    );
  }

  renderSongList() {
    if (this.state.songs === null) {
      return <span />;
    } else {
      return this.state.songs;
    }
  }

  render() {
    return (
      <div>
        <h1 id="title">SpotiShare</h1>
		{/*  */}
		<button onClick={()=>{
			if (IsLoggedIn()) CreateLobby();
			else Login()
		}}>
			Create Lobby
		</button>
        <button
          onClick={() => {
            Login()
          }}
          id="sign-in"
        >
          Sign in
        </button>

        <Row style={{ margin: "3em 1.5em 0 1.5em" }}>
          <Col xs="5">
            <h3>Current Listening Party Members:</h3>
            <div>{this.renderMembers()}</div>
          </Col>
          <Col xs="1"></Col>
          <Col>
            <div id="searchArea">
              <input
                id="searchbox"
                type="text"
                placeholder="Artist, Song Name, Album..."
              />
              <button id="search-btn">Search!</button>
            </div>
            <button
              onClick={() => {
                if (
                  IsLoggedIn()
                ) {
                  // just testing api stuff
                  fetch(
                    `/top?accessToken=${localStorage.getItem(
                      "spotify-access-token"
                    )}`
                  )
                    .then((e) => e.json())
                    .then((data) => {
                      console.log(data);
                      this.setState({
                        songs: (
                          <div>
                            {data.items.map((e) => (
                              <div className="song-card">
                                <div className="song-card">
									<iframe
										src={`https://open.spotify.com/embed/track/${e.id}?utm_source=generator`}
										width="100%"
										height="80"
										frameBorder="0"
										allowfullscreen=""
										allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
									></iframe>
								</div>
                              </div>
                            ))}
                          </div>
                        ),
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                      Login();
                    });
                } else {
                  Login();
                }
              }}
            >
              CLICK ME
            </button>
            <div>{this.renderSongList()}</div>
          </Col>
        </Row>
      </div>
    );
  }
}
async function IsLoggedIn() {
	return localStorage.getItem("spotify-access-token") &&
	localStorage.getItem("spotify-access-token-expiry") >
	  Date.now()
}
async function Login() {
  fetch("/auth/login")
    .then((e) => e.json())
    .then((data) => {
      window.location = data.redirectUri;
    })
    .catch((error) => {
      console.log("Failed to prepare for Spotify Authentication");
    });
}
async function CreateLobby() {
	fetch(`/createLobby?accessToken=${localStorage.getItem("spotify-access-token")}`)
	.then(e=>e.json())
	.then(data=>{
		window.location = data.roomId
	})
	.catch(error => {
		alert(error)
	})
}