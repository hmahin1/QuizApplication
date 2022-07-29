import React, { useState, useEffect } from 'react'
import './answer.css'
import CountDownWrapper from '../countdownwrapper/index'
import Button from '@material-ui/core/Button'
import { bindActionCreators } from 'redux'
import * as Actions from '../../actions/userActions'
import { connect } from 'react-redux'
import { data } from '../../constants/dummyData'
import firebase from 'firebase'
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
} from '@material-ui/core'

const Answers = ({
  isAdmin,
  user,
  appState,
  userResult,
  actions,
  showAnswer,
}) => {
  const [timer, setTimer] = useState(data.question[appState.state].timer)
  const [optionNumberClicked, setOptionNumberClicked] = useState(-1)
  const [duration, setDuration] = useState(
    data.question[appState.state].timer - 1,
  )
  const [questionStatus, setQuestionStatus] = useState(true)
  const [questionAskedTime, setQuestionAskedTime] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(-1)
  const [manualUpdate, setManualUpdateState] = useState({
    display: false,
    questionNumber: 1,
    allowAnswer: true,
  })

  let milliseconds = 100
  let seconds = 0

  const correctAnswer = () => {
    const answerTime = +(seconds + '.' + milliseconds)
    const questionTime = +data.question[questionNumber].timer
    const correctTime = questionTime - answerTime
    const score = +userResult.score + correctTime
    const obj = {
      rank: questionNumber,
      score: score.toFixed(2),
      totalCorrectAnswers: userResult['totalCorrectAnswers'] + 1,
    }
    actions.storeAnswer(obj, userResult['id'])
  }

  const updateCurrentQuestionClick = () => {
    const obj = {
      rank: questionNumber,
    }
    actions.storeAnswer(obj, userResult['id'])
  }
  const onCompleteTimer = () => {
    setQuestionStatus(false)
  }

  useEffect(() => {
    setOptionNumberClicked(-1)
    setTimer((timer) => timer + 1)
  }, [questionNumber])

  useEffect(() => {
    if (questionAskedTime) {
      const secondsPassedAfterQuestion = 
        (new Date().getTime() - new Date(questionAskedTime).getTime()) / 1000;
      const timeAllocatedForQuestion = data.question[questionNumber].timer;
      const timeRemaining =  timeAllocatedForQuestion - secondsPassedAfterQuestion
      if (secondsPassedAfterQuestion > 20) setDuration(0)
	    else if(timeRemaining > timeAllocatedForQuestion) setDuration(timeAllocatedForQuestion)
      else
        setDuration(
          timeAllocatedForQuestion - secondsPassedAfterQuestion,
        )
    }
  }, [questionAskedTime])

  useEffect(() => {
    // if (appState.questionStatus !== questionStatus) {
    //   debugger
    //   setQuestionStatus(appState.questionStatus)
    // }
	
    if (appState.timestamp !== questionAskedTime) {
      setQuestionAskedTime(appState.timestamp)
      setQuestionNumber(appState.state)
	    setQuestionStatus(true)
    }
  }, [appState])

  const setShowCorrectAnswer = (value) => {
    let stateToSet
    if (value == 'next-question') {
      stateToSet = false
    } else {
      stateToSet = !showAnswer
    }
    firebase
      .database()
      .ref('answerState')
      .orderByChild('state')
      .once('value', (snapshot) => {
        snapshot.forEach(function (data) {
          data.ref.set(stateToSet)
        })
      })
  }

  const handleClickAnswerCommon = (isTrue, value) => {
    if (isTrue) {
      correctAnswer()
    } else {
      updateCurrentQuestionClick()
    }
    setOptionNumberClicked(value)
  }

  const onClickNextQuestion = (isManualClicked = false) => {
    if (!isManualClicked) setShowCorrectAnswer('next-question')
    const updatedQuestionNumber = isManualClicked
      ? manualUpdate?.questionNumber - 1
      : questionNumber + 1
    firebase
      .database()
      .ref('appState')
      .orderByChild('state')
      .once('value', (snapshot) => {
        snapshot.forEach(function (data) {
          debugger
          data.ref.child('state').set(updatedQuestionNumber)
          data.ref
            .child('questionStatus')
            .set(isManualClicked ? manualUpdate?.allowAnswer : true)
          data.ref.child('timestamp').set(new Date().toISOString())
        })
      })
  }

  const children = ({ remainingTime }) => {
    if (milliseconds === 10) {
      milliseconds = 100
    } else {
      milliseconds--
    }
    seconds = remainingTime % 1000
    if (seconds < 1) {
      seconds = 0 + '0'
      milliseconds = 0 + '0'
    }

    return `${seconds}:${milliseconds}`
  }
  const lineBreakString = (value) => {
    let result = value.split('/')

    return (
      <span>
        {result[0]} <br />
        {result[1]}
      </span>
    )
  }

  const displayOptionClass = (optionNumber) => {
    if (showAnswer) {
      if (data.question[questionNumber].answer[optionNumber - 1].isTrue)
        return 'green'
      else if (optionNumber === optionNumberClicked) return 'red'
      else return 'purple'
    } else {
      if (optionNumberClicked !== -1 && optionNumber === optionNumberClicked)
        return 'grey'
      else return 'purple'
    }
  }

  if (questionNumber == -1 || appState.state === -1) {
    return <CircularProgress />
  }

  console.log('Safwan', userResult.rank == questionNumber)

  const Option = ({ index }) => (
    <div>
      <Button
        onClick={() =>
          handleClickAnswerCommon(
            data.question[questionNumber].answer[index].isTrue,
            index + 1,
          )
        }
        className={displayOptionClass(index + 1)}
        variant="outlined"
        color="primary"
        disabled={
          !questionStatus ||
          optionNumberClicked !== -1 ||
          userResult.rank == questionNumber
        }
      >
        {lineBreakString(data.question[questionNumber].answer[index].details)}
      </Button>
    </div>
  )

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
        <Option index={0} />
        <Option index={1} />
      </div>
      <div className="answer_container">
        <Option index={2} />
        <Option index={3} />
      </div>

      {isAdmin && (
        <>
          <div className="answer_container">
            <div>
              <Button
                onClick={() => onClickNextQuestion(false)}
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
                {showAnswer ? 'Hide Answer' : 'Show Answer'}
              </Button>
            </div>
            <div style={{ marginTop: '15px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(e) =>
                      setManualUpdateState({
                        ...manualUpdate,
                        display: e.target.checked,
                      })
                    }
                    defaultChecked={false}
                  />
                }
                label={<h4>Contol Manually</h4>}
              />
            </div>
          </div>
          {manualUpdate.display && (
            <div className="answer_container">
              <div>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        onChange={(e) =>
                          setManualUpdateState({
                            ...manualUpdate,
                            allowAnswer: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Allow user to answer"
                  />
                </FormGroup>
              </div>
              <div>
                <TextField
                  defaultValue={1}
                  type="number"
                  onChange={(e) =>
                    setManualUpdateState({
                      ...manualUpdate,
                      questionNumber: parseInt(e.target.value),
                    })
                  }
                  label="Question number"
                />
              </div>
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onClickNextQuestion(true)}
                >
                  Update
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
const mapStateToProps = (props) => ({})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Answers)
