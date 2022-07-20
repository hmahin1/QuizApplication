import "./App.css";
import React, { Component } from "react";
import Loading from "./components/loading/index";
import { firebaseConfig } from "./constants/apikey.js";
import firebase from "firebase/app";
import Card from "@material-ui/core/Card";
import logo from "./assets/logo.png";
import mastermind2 from "./assets/mastermind2.png";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as Actions from "./actions/userActions";

class App extends Component {
  constructor(props) {
    super(props);
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    } else {
      firebase.app(); // if already initialized, use that one
    }
    this.componentCleanup = this.componentCleanup.bind(this);
  }
  componentCleanup() {
    localStorage.setItem("close", true);
  }
  componentDidMount() {
    window.addEventListener("beforeunload", this.componentCleanup);
  }
  componentWillUnmount() {
    this.componentCleanup();
    window.removeEventListener("beforeunload", this.componentCleanup); // remove the event handler for normal unmounting
  }
  componentWillReceiveProps (){
    console.log(this.props,"Asdasd")
  }
  setShowCorrectAnswer = () => {
    const id = localStorage.getItem("id");
    console.log(id,"idd",this.disable);
    this.props.actions.userLogout(id);
    /* firebase
      .database()
      .ref("users")
      .orderByChild("id")
      .equalTo(id)
      .once("value")
      .then(snapshot => {
        if (snapshot.exists()) {
          snapshot.forEach(function(data) {
              data.ref.child("login").set(false);
              localStorage.clear();
              window.location.reload();
          });
        }
      }); */
  }

  render() {
    return (
      <div align="center">
         {this.props.isLoggedIn ? <div align="right" className="App">
         <Button
              onClick={this.setShowCorrectAnswer}
              className="logout_btn"
              variant="contained"
              color="primary"
            >
              Logout
            </Button>
        </div>: ''}
        <div align="center" className="App">
        <Card variant="outlined" className="parent_answer_container">
          <div className="logo_text_container">
            <img className="logo_image" src={logo} alt="logo" />
            <span className="text_heading">
              <span className="text_heading_sub">Presents</span>
              <br />
              <span className="text_heading_sub_main"><img className="nm_image" src={mastermind2} alt="mastermind2" /></span>
            </span>
            <span className="text_heading_cor">
              Mursaleen
              <br /> Mehmood
            </span>
          </div>
          <Loading />
        </Card>
      </div>
      </div>
      
    );
  }
}

const mapStateToProps = props => ({
  isLoggedIn: props.userReducer.loginSuccess,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
