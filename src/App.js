import React, { useState, useEffect } from "react";
import "./App.css";
import { database } from "./firebase";
import { ref, onValue, update, get, set } from "firebase/database";

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch questions from Firebase
  useEffect(() => {
    const questionsRef = ref(database, "questions");

    const unsubscribe = onValue(questionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const questionsData = snapshot.val();
        // Convert Firebase object to array
        const questionsArray = Object.keys(questionsData).map((key) => ({
          id: key,
          ...questionsData[key],
        }));
        setQuestions(questionsArray);
        setLoading(false);
      } else {
        // If no questions in database, initialize with default questions
        const defaultQuestions = [
          {
            id: "1",
            optionA: "Be able to fly",
            optionB: "Be invisible",
          },
          {
            id: "2",
            optionA: "Live without internet for a year",
            optionB: "Live without AC/heating for a year",
          },
          {
            id: "3",
            optionA: "Be 10 years older",
            optionB: "Be 10 years younger",
          },
          {
            id: "4",
            optionA: "Always have to tell the truth",
            optionB: "Always have to lie",
          },
          {
            id: "5",
            optionA: "Be fluent in all languages",
            optionB: "Be a master of all musical instruments",
          },
        ];

        // Initialize the database with default questions
        set(
          questionsRef,
          defaultQuestions.reduce((acc, question) => {
            acc[question.id] = {
              optionA: question.optionA,
              optionB: question.optionB,
            };
            return acc;
          }, {})
        );

        setQuestions(defaultQuestions);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen for votes in real-time
  useEffect(() => {
    const votesRef = ref(database, "votes");

    const unsubscribe = onValue(votesRef, (snapshot) => {
      if (snapshot.exists()) {
        setResults(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  // Check if user has voted on this question before
  useEffect(() => {
    if (questions.length > 0) {
      const currentQuestion = questions[currentQuestionIndex];
      const votedQuestions = JSON.parse(
        localStorage.getItem("votedQuestions") || "[]"
      );
      setHasVoted(votedQuestions.includes(currentQuestion.id));
    }
  }, [currentQuestionIndex, questions]);

  const handleVote = (option) => {
    if (hasVoted || questions.length === 0) return;

    const currentQuestion = questions[currentQuestionIndex];
    setSelectedOption(option);

    const questionRef = ref(database, `votes/${currentQuestion.id}`);

    // Get current votes and update them
    get(questionRef).then((snapshot) => {
      const currentVotes = snapshot.exists()
        ? snapshot.val()
        : { optionA: 0, optionB: 0 };

      // Update the database
      update(questionRef, {
        ...currentVotes,
        [option]: (currentVotes[option] || 0) + 1,
      });

      // Mark this question as voted in localStorage
      const votedQuestions = JSON.parse(
        localStorage.getItem("votedQuestions") || "[]"
      );
      votedQuestions.push(currentQuestion.id);
      localStorage.setItem("votedQuestions", JSON.stringify(votedQuestions));

      setHasVoted(true);
    });
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  // Calculate percentages for the results
  const calculatePercentage = (option) => {
    if (!results || !questions.length) return 0;

    const currentQuestion = questions[currentQuestionIndex];
    if (!results[currentQuestion.id]) return 0;

    const optionAVotes = results[currentQuestion.id].optionA || 0;
    const optionBVotes = results[currentQuestion.id].optionB || 0;
    const totalVotes = optionAVotes + optionBVotes;

    if (totalVotes === 0) return 0;

    return Math.round(
      ((results[currentQuestion.id][option] || 0) / totalVotes) * 100
    );
  };

  if (loading)
    return (
      <div className="App">
        <div className="loading">Loading questions...</div>
      </div>
    );

  if (questions.length === 0) {
    return (
      <div className="App">
        <div className="error">
          No questions available. Please check your database.
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Would You Rather?</h1>
      </header>

      <div className="question-container">
        <h2>
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>

        <div className="options">
          <div
            className={`option ${
              selectedOption === "optionA" ? "selected" : ""
            } ${hasVoted ? "voted" : ""}`}
            onClick={() => !hasVoted && handleVote("optionA")}
          >
            <p>{currentQuestion.optionA}</p>

            {hasVoted && (
              <div className="results">
                <div
                  className="progress-bar"
                  style={{ width: `${calculatePercentage("optionA")}%` }}
                ></div>
                <span>{calculatePercentage("optionA")}%</span>
                <span className="vote-count">
                  {results[currentQuestion.id]?.optionA || 0} votes
                </span>
              </div>
            )}
          </div>

          <div className="or">OR</div>

          <div
            className={`option ${
              selectedOption === "optionB" ? "selected" : ""
            } ${hasVoted ? "voted" : ""}`}
            onClick={() => !hasVoted && handleVote("optionB")}
          >
            <p>{currentQuestion.optionB}</p>

            {hasVoted && (
              <div className="results">
                <div
                  className="progress-bar"
                  style={{ width: `${calculatePercentage("optionB")}%` }}
                ></div>
                <span>{calculatePercentage("optionB")}%</span>
                <span className="vote-count">
                  {results[currentQuestion.id]?.optionB || 0} votes
                </span>
              </div>
            )}
          </div>
        </div>

        {hasVoted && (
          <button className="next-button" onClick={nextQuestion}>
            Next Question
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
