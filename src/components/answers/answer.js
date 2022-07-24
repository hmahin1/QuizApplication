import React, { useState, useEffect } from "react";
import "./answer.css";
import CountDownWrapper from "../countdownwrapper/index";
import Button from "@material-ui/core/Button";
import { bindActionCreators } from "redux";
import * as Actions from "../../actions/userActions";
import { connect } from "react-redux";
import { data } from "../../constants/dummyData";
import firebase from "firebase";
import { CircularProgress } from "@material-ui/core";

const Answers = ({ isAdmin, user, appState, userResult, actions, showAnswer }) => {
  const [timer, setTimer] = useState(data.question[appState.state].timer);
  const [optionNumberClicked, setOptionNumberClicked] = useState(-1);
  const [duration, setDuration] = useState(
    data.question[appState.state].timer - 1
  );
  const [questionStatus, setQuestionStatus] = useState(false);
  const [questionAskedTime, setQuestionAskedTime] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(-1);

  let milliseconds = 100;
  let seconds = 0;

  const correctAnswer = () => {
    const answerTime = +(seconds + "." + milliseconds);
    const questionTime = +data.question[questionNumber].timer;
    const correctTime = questionTime - answerTime;
    const score = +userResult.score + correctTime;
    const obj = {
      rank: questionNumber,
      score: score.toFixed(2),
      totalCorrectAnswers: userResult["totalCorrectAnswers"] + 1

    };
    actions.storeAnswer(obj, userResult["id"]);
  };

  const updateCurrentQuestionClick = () => {
    const obj = {
      rank: questionNumber,
    };
    actions.storeAnswer(obj, userResult["id"]);
  };
  const onCompleteTimer = () => {
    milliseconds = 0;
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

  useEffect(() => {
    setOptionNumberClicked(-1);
    setTimer(timer => timer + 1);
  }, [questionNumber])

  useEffect(() => {
    if(questionAskedTime){
      const secondsPassedAfterQuestion = (new Date().getTime() - new Date(questionAskedTime).getTime())/1000;
      if(secondsPassedAfterQuestion > 20) setDuration(0)
      else setDuration(data.question[questionNumber].timer - secondsPassedAfterQuestion );
    }
  }, [questionAskedTime])

  useEffect(() => {
    if (appState.questionStatus !== questionStatus) {
      setQuestionStatus(appState.questionStatus)
    }
    if (questionNumber === -1) {
      setQuestionNumber(appState.state)
    }
    if (appState.timestamp !== questionAskedTime) {
      setQuestionAskedTime(appState.timestamp)
      if(questionNumber !== -1) setQuestionNumber(item => item + 1)
    }
  }, [appState]);


  const setShowCorrectAnswer = (value) => {
    let stateToSet; 
    if(value == 'next-question'){
      stateToSet = false;
    }else{
      stateToSet = !showAnswer;
    }
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
      if (isTrue) {
        correctAnswer();
      } else {
        updateCurrentQuestionClick();
      }
      setOptionNumberClicked(value);
  };

  const onClickNextQuestion = () => {
    setShowCorrectAnswer('next-question');
    const milliseconds = questionNumber + 1;
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
      if(data.question[questionNumber].answer[optionNumber-1].isTrue) return "green";
      else if(optionNumber === optionNumberClicked) return "red";
      else return "purple";
    } else {
      if(optionNumberClicked !== -1 && optionNumber === optionNumberClicked) return "grey";
      else  return "purple";
    }
  }

  if(questionNumber == -1) {
    return <CircularProgress />
  }

  return (
    <div className="answer_component">
      <span align="left" className="question_no_container">
        Question {questionNumber + 1} / 40
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
        <p>{data.question[questionNumber].description}</p>
        <p>{data.question[questionNumber].description2}</p>
      </div>

      <div className="answer_container">
        <div>
          <Button
            onClick={() =>
              handleClickAnswerCommon(
                data.question[questionNumber].answer[0].isTrue,
                1
              )
            }
            className={displayOptionClass(1)}
            variant="outlined"
            color="primary"
            disabled={!questionStatus || userResult.rank == questionNumber}
          >
            {lineBreakString(data.question[questionNumber].answer[0].details)}
          </Button>
        </div>
        <div>
          <Button
            onClick={() =>
              handleClickAnswerCommon(
                data.question[questionNumber].answer[1].isTrue,
                2
              )
            }
            className={displayOptionClass(2)}
            variant="outlined"
            color="primary"
            disabled={!questionStatus || userResult.rank == questionNumber}
          >
            {lineBreakString(data.question[questionNumber].answer[1].details)}
          </Button>
        </div>
      </div>
      <div className="answer_container">
        <div>
          <Button
            onClick={e =>
              handleClickAnswerCommon(
                data.question[questionNumber].answer[2].isTrue,
                3
              )
            }
            className={displayOptionClass(3)}
            variant="outlined"
            color="primary"
            disabled={!questionStatus || userResult.rank == questionNumber}
          >
            {lineBreakString(data.question[questionNumber].answer[2].details)}
          </Button>
        </div>
        <div>
          <Button
            onClick={e =>
              handleClickAnswerCommon(
                data.question[questionNumber].answer[3].isTrue,
                4
              )
            }
            className={displayOptionClass(4)}
            variant="outlined"
            color="primary"
            disabled={!questionStatus || userResult.rank == questionNumber}
          >
            {lineBreakString(data.question[questionNumber].answer[3].details)}
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
              onClick={() => setShowCorrectAnswer('show-hide')}
              className="admin_button"
              variant="contained"
              color="primary"
            >
             {showAnswer ? 'Hide Answer': 'Show Answer'}
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
