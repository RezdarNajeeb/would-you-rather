import React, { useState, useEffect, useContext } from "react";
import "./App.css";
import { database, defaultQuestions } from "./firebase";
import { ref, onValue, update, get, set } from "firebase/database";
import BurgerMenu from "./components/BurgerMenu";
import { ThemeContext } from "./contexts/ThemeContext";
import { LanguageContext, LANGUAGES } from "./contexts/LanguageContext";

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
  const { theme } = useContext(ThemeContext);
  const { language, t } = useContext(LanguageContext);

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

    const unsubscribe = onValue(
      questionsRef,
      (snapshot) => {
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
          set(
            questionsRef,
            defaultQuestions.reduce((acc, question) => {
              acc[question.id] = {
                en: question.en,
                ku: question.ku,
              };
              return acc;
            }, {})
          );

          setQuestions(shuffleArray(defaultQuestions));
          setLoading(false);
        }
      },
      (error) => {
        console.error("Database error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen for votes in real-time
  useEffect(() => {
    const votesRef = ref(database, "votes");

    const unsubscribe = onValue(
      votesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setResults(snapshot.val());
        }
      },
      (error) => {
        console.error("Votes retrieval error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleVote = (option) => {
    if (
      hasVoted ||
      questions.length === 0 ||
      currentQuestionIndex >= questions.length
    )
      return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.id) return;

    setSelectedOption(option);

    const questionRef = ref(database, `votes/${currentQuestion.id}`);

    // Get current votes and update them
    get(questionRef)
      .then((snapshot) => {
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
      })
      .catch((error) => {
        console.error("Error updating vote:", error);
        setHasVoted(false);
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
    if (
      !results ||
      !questions.length ||
      currentQuestionIndex >= questions.length
    )
      return 0;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !currentQuestion.id || !results[currentQuestion.id])
      return 0;

    const optionAVotes = results[currentQuestion.id].optionA || 0;
    const optionBVotes = results[currentQuestion.id].optionB || 0;
    const totalVotes = optionAVotes + optionBVotes;

    if (totalVotes === 0) return 0;

    return Math.round(
      ((results[currentQuestion.id][option] || 0) / totalVotes) * 100
    );
  };

  // Get current question options based on selected language
  const getCurrentQuestionOptions = () => {
    if (!questions.length || currentQuestionIndex >= questions.length)
      return { optionA: "", optionB: "" };

    const currentQuestion = questions[currentQuestionIndex];
    const langKey = language === LANGUAGES.KURDISH ? "ku" : "en";

    // Check if the language-specific options exist, if not fall back to English
    return currentQuestion[langKey] &&
      currentQuestion[langKey].optionA !== undefined &&
      currentQuestion[langKey].optionB !== undefined
      ? currentQuestion[langKey]
      : currentQuestion.en || { optionA: "", optionB: "" };
  };

  if (loading)
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">{t("loading")}</div>
        </div>
      </div>
    );

  if (questions.length === 0) {
    return (
      <div className="App">
        <div className="error">{t("noQuestions")}</div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className={`App ${fadeOut ? "fade-out" : "fade-in"}`}>
        <BurgerMenu />

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
          <h1>{t("gameComplete")}</h1>
          <p>{t("answeredAll")}</p>
          <p className="stats-text">{t("statsText")}</p>
          <button className="replay-button" onClick={handleReplay}>
            <i className="fas fa-redo-alt"></i> {t("playAgain")}
          </button>
        </div>
      </div>
    );
  }

  const questionOptions = getCurrentQuestionOptions();

  return (
    <div className={`App ${fadeOut ? "fade-out" : "fade-in"}`}>
      <BurgerMenu />

      <div className="background-animation">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <header className="App-header">
        <h1>{t("appTitle")}</h1>
      </header>

      <div className="question-container">
        <div className="question-number">
          <span>{currentQuestionIndex + 1}</span> {t("of")} {questions.length}
        </div>

        <div className="options-container">
          <div
            className={`option ${
              selectedOption === "optionA" ? "selected" : ""
            } ${hasVoted ? "voted" : ""}`}
            onClick={() => !hasVoted && handleVote("optionA")}
          >
            <div className="option-content">
              <div className="option-text">{questionOptions.optionA || ""}</div>

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
            <div className="versus">{t("versus")}</div>
          </div>

          <div
            className={`option ${
              selectedOption === "optionB" ? "selected" : ""
            } ${hasVoted ? "voted" : ""}`}
            onClick={() => !hasVoted && handleVote("optionB")}
          >
            <div className="option-content">
              <div className="option-text">{questionOptions.optionB || ""}</div>

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
