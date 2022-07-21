import React, { useState, useEffect } from "react";
import "./answer.css";
import CountDownWrapper from "../countdownwrapper/index";
import Button from "@material-ui/core/Button";
import { bindActionCreators } from "redux";
import * as Actions from "../../actions/userActions";
import { connect } from "react-redux";
import { data } from "../../constants/dummyData";
import firebase from "firebase";

const Answers = ({ isAdmin, user, appState, userResult, actions, showAnswer }) => {
  const [timer, setTimer] = useState(data.question[appState.state].timer);
  // const [clickable, isClickable] = useState(true);
  const [optionNumberClicked, setOptionNumberClicked] = useState(-1);
  const [duration, setDuration] = useState(
    data.question[appState.state].timer - 1
  );
  // const [answerColor1, setAnswerColor1] = useState("purple");
  // const [answerColor2, setAnswerColor2] = useState("purple");
  // const [answerColor3, setAnswerColor3] = useState("purple");
  // const [answerColor4, setAnswerColor4] = useState("purple");
  // const [showCorrectAnswer] = useState("green");
  const [questionStatus, setQuestionStatus] = useState(false);
  const [questionAskedTime, setQuestionAskedTime] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);

  let milliseconds = 100;
  let seconds = 0;

  const correctAnswer = () => {
    const answerTime = +(seconds + "." + milliseconds);
    const questionTime = +data.question[appState.state].timer;
    const correctTime = questionTime - answerTime;
    const score = +userResult.score + correctTime;
    const obj = {
      rank: appState.state,
      score: score.toFixed(2),
      totalCorrectAnswers: userResult["totalCorrectAnswers"] + 1

    };
    actions.storeAnswer(obj, userResult["id"]);
  };

  const updateCurrentQuestionClick = () => {
    const obj = {
      rank: appState.state,
    };
    actions.storeAnswer(obj, userResult["id"]);
  };
  const onCompleteTimer = () => {
    // isClickable(false);
    milliseconds = 0;
    console.log(user, "userss");
    if (user.role == "admin" || JSON.stringify(user.role == "admin")) {
      console.log("completessd timer asdasd");
      firebase
        .database()
        .ref("appState")
        .orderByChild("questionStatus")
        .once("value", snapshot => {
          snapshot.forEach(function (data) {
            data.ref.child("questionStatus").set(false);
          });
        });
    }

  };
  // const answerSwitch = (answer, color) => {
  //   switch (answer) {
  //     case 1:
  //       setAnswerColor1(color);
  //       break;
  //     case 2:
  //       setAnswerColor2(color);
  //       break;
  //     case 3:
  //       setAnswerColor3(color);
  //       break;
  //     default:
  //       setAnswerColor4(color);
  //       break;
  //   }
  // };

  // useEffect(() => {
  //   console.log(showAnswer,'opppppp')
  //   if (showAnswer) {
  //     debugger;
  //     data.question[appState.state].answer.forEach((e, i) => {
  //       if (e.isTrue) {
  //         answerSwitch(i + 1, "green");
  //         return;
  //       }
  //     });
  //   }
  // }, [showAnswer])

  // useEffect(() => {
  //   if (!questionStatus) {
  //     isClickable(false);
  //     // setDuration(0);
  //   }
  // }, [questionStatus])

  useEffect(() => {
    // isClickable(true);
    // setDuration(data.question[appState.state].timer - 1);
    // setAnswerColor1("purple");
    // setAnswerColor2("purple");
    // setAnswerColor3("purple");
    // setAnswerColor4("purple");
    setOptionNumberClicked(-1);
    setTimer(timer => timer + 1);
  }, [questionNumber])

  useEffect(() => {
    debugger
    if(questionAskedTime){

      // isClickable(true);
      console.log(new Date().toISOString(),  new Date())
      const secondsPassedAfterQuestion = (new Date().getTime() - new Date(questionAskedTime).getTime())/1000;
      if(secondsPassedAfterQuestion > 20) setDuration(0)
      else setDuration(data.question[appState.state].timer - secondsPassedAfterQuestion );
    }
    // setAnswerColor1("purple");
    // setAnswerColor2("purple");
    // setAnswerColor3("purple");
    // setAnswerColor4("purple");
    // setTimer(timer => timer + 1);
  }, [questionAskedTime, ])

  useEffect(() => {
    
    if (appState.questionStatus !== questionStatus) {
      setQuestionStatus(appState.questionStatus)
    }
    if (appState.state !== questionNumber) {
      setQuestionNumber(appState.state)
    }
    if (appState.timestamp !== questionAskedTime) {
      setQuestionAskedTime(appState.timestamp)
    }

    /* if (!appState.questionStatus) {
      isClickable(false);
      setDuration(0);
    } else {
      isClickable(true);
      setDuration(data.question[appState.state].timer - 1);
      setAnswerColor1("purple");
      setAnswerColor2("purple");
      setAnswerColor3("purple");
      setAnswerColor4("purple");
    }
    setTimer(timer => timer + 1); */
  }, [appState]);


  const setShowCorrectAnswer = (stateToSet) => {
    firebase
      .database()
      .ref("answerState")
      .orderByChild("state")
      .once("value", snapshot => {
        snapshot.forEach(function (data) {
          data.ref.set(stateToSet);
        });
      });
  }

  const handleClickAnswerCommon = (isTrue, value) => {
    // if (clickable) {
      if (isTrue) {
        correctAnswer();
      } else {
        updateCurrentQuestionClick();
      }
      setOptionNumberClicked(value);
      // isClickable(false);
    // }
  };

  const onClickNextQuestion = () => {
    const milliseconds = appState.state + 1;
    setShowCorrectAnswer(false);

    // localStorage.setItem("close",false);
    firebase
      .database()
      .ref("appState")
      .orderByChild("state")
      .once("value", snapshot => {
        snapshot.forEach(function (data) {
          data.ref.child("state").set(milliseconds);
          data.ref.child("questionStatus").set(true);
          data.ref.child("timestamp").set(new Date().toISOString());
        });
      });
  };

  const children = ({ remainingTime }) => {
    if (milliseconds === 10) {
      milliseconds = 100;
    } else {
      milliseconds--;
    }
    seconds = remainingTime % 1000;
    if (seconds < 1) {
      seconds = 0 + "0";
      milliseconds = 0 + "0";
    }

    return `${seconds}:${milliseconds}`;
  };
  const lineBreakString = value => {
    let result = value.split("/");

    return (
      <span>
        {result[0]} <br />
        {result[1]}
      </span>
    );
  };

  const displayOptionClass = (optionNumber) => {
    if(showAnswer){
      if(data.question[appState.state].answer[optionNumber-1].isTrue) return "green";
      else if(optionNumber === optionNumberClicked) return "red";
      else return "purple";
    } else {
      if(optionNumberClicked !== -1 && optionNumber === optionNumberClicked) return "grey";
      else  return "purple";
    }
  }

  return (
    <div className="answer_component">
      <span align="left" className="question_no_container">
        Question {appState.state + 1} / 40
      </span>
      <div className="timer" align="center">
        <CountDownWrapper
          children={children}
          onComplete={onCompleteTimer}
          timer={timer}
          duration={duration}
        />
      </div>

      <div align="center" className="question">
        <p>{data.question[appState.state].description}</p>
        <p>{data.question[appState.state].description2}</p>
      </div>

      <div className="answer_container">
        <div>
          <Button
            onClick={() =>
              handleClickAnswerCommon(
                data.question[appState.state].answer[0].isTrue,
                1
              )
            }
            // className={answerColor1}
            // className={showAnswer ? data.question[appState.state].answer[0].isTrue ? "green" : "purple" : "purple"}
            className={displayOptionClass(1)}
            variant="outlined"
            color="primary"
            disabled={!appState.questionStatus || userResult.rank == appState.state}
          >
            {lineBreakString(data.question[appState.state].answer[0].details)}
          </Button>
        </div>
        <div>
          <Button
            onClick={() =>
              handleClickAnswerCommon(
                data.question[appState.state].answer[1].isTrue,
                2
              )
            }
            // className={answerColor2}
            // className={showAnswer ? data.question[appState.state].answer[1].isTrue ? "green" : "purple" : "purple"}
            className={displayOptionClass(2)}
            variant="outlined"
            color="primary"
            disabled={!appState.questionStatus || userResult.rank == appState.state}
          >
            {lineBreakString(data.question[appState.state].answer[1].details)}
          </Button>
        </div>
      </div>
      <div className="answer_container">
        <div>
          <Button
            onClick={e =>
              handleClickAnswerCommon(
                data.question[appState.state].answer[2].isTrue,
                3
              )
            }
            // className={answerColor3}
            // className={showAnswer ? data.question[appState.state].answer[2].isTrue ? "green" : "purple" : "purple"}
            className={displayOptionClass(3)}
            variant="outlined"
            color="primary"
            disabled={!appState.questionStatus || userResult.rank == appState.state}
          >
            {lineBreakString(data.question[appState.state].answer[2].details)}
          </Button>
        </div>
        <div>
          <Button
            onClick={e =>
              handleClickAnswerCommon(
                data.question[appState.state].answer[3].isTrue,
                4
              )
            }
            // className={showAnswer ? data.question[appState.state].answer[3].isTrue ? "green" : "purple" : "purple"}
            className={displayOptionClass(4)}
            variant="outlined"
            color="primary"
            disabled={!appState.questionStatus || userResult.rank == appState.state}
          >
            {lineBreakString(data.question[appState.state].answer[3].details)}
          </Button>
        </div>
      </div>

      {isAdmin && (
        <div className="answer_container">
          <div>
            <Button
              onClick={onClickNextQuestion}
              className="admin_button"
              variant="contained"
              color="primary"
            >
              Next Question
            </Button>
          </div>
          <div>
            <Button
              onClick={() => setShowCorrectAnswer(true)}
              className="admin_button"
              variant="contained"
              color="primary"
            >
              Show Answer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
const mapStateToProps = props => ({});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Answers);
