import React, { useState, useEffect } from "react";
import "./App.css";
import { database } from "./firebase";
import { ref, onValue, update, get, set } from "firebase/database";

// Shuffle array function using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [results, setResults] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Fetch questions from Firebase
  useEffect(() => {
    const questionsRef = ref(database, "questions");

    const unsubscribe = onValue(questionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const questionsData = snapshot.val();
        // Convert Firebase object to array and shuffle
        const questionsArray = Object.keys(questionsData).map((key) => ({
          id: key,
          ...questionsData[key],
        }));
        setQuestions(shuffleArray(questionsArray));
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

        setQuestions(shuffleArray(defaultQuestions));
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

      setHasVoted(true);

      // Create random particles animation effect
      const particles = document.querySelectorAll(".particle");
      particles.forEach((particle) => {
        // Random position
        const x = (Math.random() - 0.5) * 600;
        const y = (Math.random() - 0.5) * 600;
        particle.style.setProperty("--x", `${x}px`);
        particle.style.setProperty("--y", `${y}px`);
      });

      // Automatically go to next question after a delay
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setFadeOut(true);
          setTimeout(() => {
            setSelectedOption(null);
            setHasVoted(false);
            setCurrentQuestionIndex((prev) => prev + 1);
            setFadeOut(false);
          }, 500); // Matches the CSS transition time
        } else {
          // If this was the last question, show game over screen
          setFadeOut(true);
          setTimeout(() => {
            setGameOver(true);
            setFadeOut(false);
          }, 500);
        }
      }, 3000); // Show results for 3 seconds before moving on
    });
  };

  const handleReplay = () => {
    setFadeOut(true);
    setTimeout(() => {
      setQuestions(shuffleArray(questions));
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setHasVoted(false);
      setGameOver(false);
      setFadeOut(false);
    }, 500);
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
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading questions...</div>
        </div>
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

  if (gameOver) {
    return (
      <div className={`App ${fadeOut ? "fade-out" : "fade-in"}`}>
        <div className="background-animation">
          <div className="blob blob1"></div>
          <div className="blob blob2"></div>
          <div className="blob blob3"></div>
        </div>

        <div className="game-over-container">
          <div className="confetti-container"></div>
          <div className="trophy-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <h1>Game Complete!</h1>
          <p>You've answered all the questions.</p>
          <p className="stats-text">How did your choices compare to others?</p>
          <button className="replay-button" onClick={handleReplay}>
            <i className="fas fa-redo-alt"></i> Play Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className={`App ${fadeOut ? "fade-out" : "fade-in"}`}>
      <div className="background-animation">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <header className="App-header">
        <h1>Would You Rather?</h1>
      </header>

      <div className="question-container">
        <div className="question-number">
          <span>{currentQuestionIndex + 1}</span> / {questions.length}
        </div>

        <div className="options-container">
          <div
            className={`option ${
              selectedOption === "optionA" ? "selected" : ""
            } ${hasVoted ? "voted" : ""}`}
            onClick={() => !hasVoted && handleVote("optionA")}
          >
            <div className="option-content">
              <div className="option-text">{currentQuestion.optionA}</div>

              {hasVoted && (
                <div className="results-container">
                  <div className="percentage-display">
                    <i className="fas fa-chart-pie percentage-icon"></i>
                    <div className="percentage-value">
                      {calculatePercentage("optionA")}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="versus-container">
            <div className="versus">VS</div>
          </div>

          <div
            className={`option ${
              selectedOption === "optionB" ? "selected" : ""
            } ${hasVoted ? "voted" : ""}`}
            onClick={() => !hasVoted && handleVote("optionB")}
          >
            <div className="option-content">
              <div className="option-text">{currentQuestion.optionB}</div>

              {hasVoted && (
                <div className="results-container">
                  <div className="percentage-display">
                    <i className="fas fa-chart-pie percentage-icon"></i>
                    <div className="percentage-value">
                      {calculatePercentage("optionB")}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasVoted && (
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
