import React, { useState, useEffect } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import "./index.css";
import firebase from "firebase";
import * as Actions from "../../actions/userActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

const useStylesReddit = makeStyles(theme => ({
  root: {
    border: "1px solid #e2e2e1",
    overflow: "hidden",
    borderRadius: 4,
    backgroundColor: "#fcfcfb",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    "&:hover": {
      backgroundColor: "#fff"
    },
    "&$focused": {
      backgroundColor: "#fff",
      boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
      borderColor: theme.palette.primary.main
    }
  },
  focused: {}
}));

function RedditTextField(props) {
  const classes = useStylesReddit();

  return (
    <TextField InputProps={{ classes, disableUnderline: true }} {...props} />
  );
}

const CustomizedInputs = ({
  actions,
  error,
  loginSuccess,
  user,
  isLoggedIn,
  errorMessage
}) => {
  const [value, setValue] = useState("");
  const [errorValue, setErrorValue] = useState("Please Enter Value");
  const [errors, isError] = useState(false);
  const [data, setData] = useState([]);
  useEffect(() => {
    if (loginSuccess) {
      actions.getLoginState();
      actions.getUserResult(localStorage.getItem("id"));
    }
  }, [user]);

  useEffect(() => {
    isError(error);
  }, [error]);
  /* useEffect(() => {
    let datas = [];
    firebase
      .database()
      .ref("users")
      .orderByChild("id")
      .once("value", snapshot => {
        snapshot.forEach(function(data) {
          datas.push(data.val());
        });
        datas.map(d => {
          console.log(d.id,"asdas")
          actions.configureUser(d.id);
        })
      });
    let userResults = [];
    firebase
      .database()
      .ref("userResults")
      .once("value", snapshot => {
        snapshot.forEach(function(data) {
          userResults.push(data.val());
        });
        const obj = {
          rank: -1,
          score: 0,
          totalCorrectAnswers: 0
        };
        userResults.map(d => {
          actions.configureUserResults(obj, d.id);
        })
        console.log(userResults,"Asdasd");
      });
      let appstate = [];
      firebase
      .database()
      .ref("appState")
      .once("value", snapshot => {
        snapshot.forEach(function(data) {
          appstate.push(data.val());
        });
        const obj = {
          questionStatus: true,
          showResult: false,
          state: 0
        };
        appstate.map(d => {
          actions.configureAppState();
          actions.changeLoginState();
        })
        console.log(appstate,"Asdasd");
      });
  }, []); */
  const handleSubmit = () => {
    actions.getUserData(value);
    console.log("Error: " + error);
    if (error) {
      setErrorValue("Please Enter Value");
      isError(error);
    }
  };

  const handleChange = e => {
    isError(false);
    setValue(e.target.value);
  };

  const startQuiz = () => {
    firebase
    .database()
    .ref('answerState')
    .orderByChild('state')
    .once('value', (snapshot) => {
      snapshot.forEach(function (data) {
        data.ref.set(false)
      })
    })
    firebase
      .database()
      .ref("appState")
      .orderByChild("state")
      .once("value", snapshot => {
        snapshot.forEach(function (data) {
          data.ref.child("questionStatus").set(true);
          data.ref.child("timestamp").set(new Date().toISOString());
        });
      });
    actions.getShowAnswerState();
    actions.startQuiz();
    
  };
  return (
    <div className="input_container" align="center">
      {!loginSuccess && !isLoggedIn && (
        <>
          <RedditTextField
            label="Enter your key"
            defaultValue={value}
            onChange={e => handleChange(e)}
            variant="filled"
            id="reddit-input"
          />
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            className="submitButton"
            disabled={!value}
          >
            submit
          </Button>
        </>
      )}
      {loginSuccess && !isLoggedIn && user.role === "user" && (
        <>
          <p className="quiz_start_text">
            <p>
              Hello{" "}
              <span style={{ fontWeight: "bold", color: "#194171" }}>
                {user.name}!{" "}
              </span>
              Welcome to the Nawait Mastermind
            </p>

            <p className="quiz_start_text_ins" align="left">
              Instructions
            </p>
            <ol className="quiz_start_text_ol" align="left">
              <li>Each category has 10 questions. <br /> .ہر زمرے میں 10 سوالات ہیں </li> <br />
              <li>
                Time of each question of Hazrat Umar (R.A) and Nawait
                categories is 20 seconds.
                <br />
              حضرت عمر رضی اللہ عنہ اور نوائط کے ہر سوال کا وقت 20 سیکنڈ ہے۔
           
              </li>
              <br />
              <li>Time of each question of Allama Iqbal and IQ is 30 seconds.
             
              <br />
              علامہ اقبال اور عقل کے ہر سوال کا وقت 30 سیکنڈ ہے۔
              </li>
              <br />

              <li>Participant can only answer one question at a time.
              <br />
              شریک ایک وقت میں صرف ایک سوال کا جواب دے سکتا ہے۔
              </li>
              <br />
              <li>Participant can not answer after the timer has finished.
              <br />
              ٹائمر ختم ہونے کے بعد شریک جواب نہیں دے سکتا۔
              </li>
              <br />
              <li>Participant can not answer the current question if he/she change the tab or refresh the page
              <br />
              شرکت کنندہ موجودہ سوال کا جواب نہیں دے سکتا اگر وہ ٹیب کو تبدیل کرتا ہے یا صفحہ کو ریفریش کرتا ہے۔
              </li>
              <br />
              <li>
                
                Top 15 participants result will be shown after compeletion of
                each category.
                <br />
                سرفہرست 15 شرکاء کا نتیجہ ہر زمرہ مکمل ہونے کے بعد دکھایا جائے گا۔
                
              </li>
              <br />
              <li>
                Result will be based on two factors. Total Number of true
                answers and total time.
                <br />
                نتیجہ دو عوامل پر مبنی ہوگا۔ صحیح جوابات کی کل تعداد اور کل وقت۔
              </li>
              <br />
              <li>
                If more than 1 participant has same number of true answers, then
                result will calculate on total time i.e. the one who answered
                question in less amount of time.
                <br />
                اگر 1 سے زیادہ شرکاء کے صحیح جوابات کی ایک ہی تعداد ہے، تو نتیجہ کل وقت پر حساب کیا جائے گا یعنی جس نے کم وقت میں سوال کا جواب دیا۔

              </li>
              <br />
              <li>
                Top 50 participants will be shown in the final result after quiz
                will end.
                <br />
                کوئز ختم ہونے کے بعد فائنل رزلٹ میں ٹاپ 50 شرکاء کو دکھایا جائے گا۔
              </li>
              <br />
            </ol>

            <p align="center" style={{ fontWeight: "bold", fontSize: "25px" }}>
              Best of luck!
            </p>
          </p>
        </>
      )}
      {loginSuccess && !isLoggedIn && user.role === "admin" && (
        <>
          <Button
            onClick={startQuiz}
            variant="contained"
            color="primary"
            className="submitButton"
          >
            Start Quiz
          </Button>
        </>
      )}

      {errors && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

const mapStateToProps = props => ({
  loginSuccess: props.userReducer.loginSuccess,
  isLoggedIn: props.userReducer.isLoggedIn,
  user: props.userReducer.user,
  error: props.userReducer.error,
  errorMessage: props.userReducer.errorMessage
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(CustomizedInputs);
