/**
 * Loop through any part of a youtube video.
 * I needed it for watching music tutorials on youtube
 * By Nick Okapi
 * Licence: MIT
 *
 * Everything is in one file because codesandbox.io
 * once deleted my other files :(
 **/

import React from "react";
import ReactDOM from "react-dom";
import YouTube from "react-youtube";
import uniq from "lodash.uniq";
import styled from "styled-components";
import "./styles.css";

// Components
const ClearStorageButton = styled.button`
  background: #e93c3c;
  color: white;
  padding: 10px;
  margin: 10px 0;
  border-radius: 2px;
  border: none;
`;

const HistoryButton = styled.button`
  background: #184850;
  color: white;
  padding: 10px;
  margin: 2px;
  border-radius: 2px;
  border: none;
`;

const HistorySection = styled.section`
  margin: 10px 0;
`;

const Footer = styled.footer`
  margin-top: 50px;
  color: gray;
`;

const PlayButton = styled.button`
  background-color: #3cc03c;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin: 10px 0;
  border: none;
  min-width: 300px;
`;

const Label = styled.label`
  margin: 10px 0;
  display: block;
`;

const Slider = styled.input`
  width: 90vw;
`;

const TextBox = styled.input`
  width: 100%;
  min-height: 40px;
  font-size: 16px;
  border: 1px solid lightblue;
  padding: 5px;
`;

const initialState = {
  currentTime: 0,
  startTime: 0,
  endTime: 0,
  videoId: "",
  // default to some cat video
  input: "2g811Eo7K8U",
  duration: 0,
  videoHistory: [],
  cleanerInput: ""
};

class App extends React.Component {
  state = initialState;
  componentDidMount = () => {
    const persistedState = window.localStorage.getItem("looperState");
    if (persistedState) {
      this.setState(JSON.parse(persistedState));
    }
  };

  persistState = () => {
    localStorage.setItem("looperState", JSON.stringify(this.state));
  };

  handleInputChange = event => {
    this.setState({ input: event.target.value });
  };

  handleVideoChange = () => {
    const { videoHistory } = this.state;

    this.setState({
      videoId: this.state.input,
      videoHistory: uniq([...videoHistory, this.state.input])
    });
  };

  handleStartChange = event => {
    this.setState({ startTime: parseFloat(event.target.value) });
    this.persistState();
  };

  handleEndChange = event => {
    this.setState({ endTime: parseFloat(event.target.value) });
    this.persistState();
  };

  handleHistoryClick = history => {
    this.setState({ input: history });
  };

  // copied from stackoverflow
  getYoutubeId = event => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/gim;
    const str = event.target.value;

    let m;
    while ((m = regex.exec(str)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        this.setState({ cleanerInput: str, input: match });
      });
    }
  };

  clearStorage = () => {
    if (window.confirm("Remove all playback history?")) {
      window.localStorage.removeItem("looperState");
      this.setState(Object.assign({}, initialState));
    }
  };

  render() {
    const opts = {
      height: "270",
      width: "480",
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 1
      }
    };

    return (
      <div>
        <div className={"youtubeContainer"}>
          <YouTube
            videoId={this.state.videoId}
            opts={opts}
            onReady={this.onReady}
            id={"looper"}
          />
        </div>

        <div>
          <div style={{ color: "blue", margin: "0" }}>
            {this.state.currentTime !== undefined &&
              this.state.currentTime.toFixed(0)}
            s{" "}
          </div>
          <PlayButton onClick={this.handleVideoChange}>PLAY</PlayButton>
          <Label htmlFor="start">start: {this.state.startTime}s</Label>
          <Slider
            type="range"
            id="start"
            max={this.state.duration}
            value={this.state.startTime}
            onChange={this.handleStartChange}
          />
          <Label htmlFor="end">end: {this.state.endTime}s</Label>
          <Slider
            type="range"
            id="end"
            max={this.state.duration}
            value={this.state.endTime}
            onChange={this.handleEndChange}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <Label htmlFor={"youtubeId"}>YouTube id</Label>

          <TextBox
            type="search"
            id="youtubeId"
            value={this.state.input}
            onChange={this.handleInputChange}
          />
        </div>

        <div>
          <Label htmlFor={"youtubeUrl"}>YouTube Url</Label>
          <TextBox
            type="search"
            id={"youtubeUrl"}
            value={this.state.cleanerInput}
            placeholder={"paste any youtube url"}
            onChange={this.getYoutubeId}
          />
        </div>
        <div>
          <Label htmlFor={"title"}>Title</Label>
          <TextBox
            type="search"
            id={"title"}
            value={this.state.cleanerInput}
            placeholder={"paste any youtube url"}
            onChange={this.getYoutubeId}
          />
        </div>
        {this.state.videoHistory.length >= 1 && (
          <HistorySection>
            <div>History:{" "}</div>
            {uniq(this.state.videoHistory).map(history => (
              <HistoryButton
                onClick={() => {
                  this.handleHistoryClick(history);
                }}
              >
                {history}
              </HistoryButton>
            ))}
            <div>
              <ClearStorageButton onClick={this.clearStorage}>
                Clear History
              </ClearStorageButton>
            </div>
          </HistorySection>
        )}
        <Footer>
          YouTube looper by Nick Okapi.{" "}
          <a href="https://codesandbox.io/s/wkjn5r7jr5">source code</a>
        </Footer>
      </div>
    );
  }

  onReady = event => {
    const player = event.target;
    player.pauseVideo();
    // video loop mechanism is here
    setInterval(() => {
      let currentTime = player.getCurrentTime();
      this.setState(
        {
          currentTime: currentTime,
          duration: player.getDuration()
        },
        () => {
          // jump back to the end time set by the slider
          if (currentTime > this.state.endTime) {
            player.seekTo(this.state.startTime);
          }
        }
      );
    }, 1000);
  };
}

const rootElement = document.getElementById("root");

ReactDOM.render(<App />, rootElement);
