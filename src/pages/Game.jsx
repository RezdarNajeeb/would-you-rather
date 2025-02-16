import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase';

const Game = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [results, setResults] = useState(null);
  const [userVoted, setUserVoted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsCollection = collection(db, 'questions');
        const questionSnapshot = await getDocs(questionsCollection);
        const questionList = questionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (questionList.length === 0) {
          setError('No questions found. Please add some questions first.');
        } else {
          setQuestions(questionList);
        }
      } catch (err) {
        setError('Error fetching questions: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      checkIfUserVoted();
    }
  }, [questions, currentQuestionIndex]);

  const checkIfUserVoted = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (userData?.answers && userData.answers[questions[currentQuestionIndex].id]) {
        setUserVoted(true);
        setSelectedOption(userData.answers[questions[currentQuestionIndex].id]);
        fetchResults();
      } else {
        setUserVoted(false);
        setSelectedOption(null);
        setResults(null);
      }
    } catch (err) {
      console.error('Error checking if user voted:', err);
    }
  };

  const handleVote = async (option) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const currentQuestion = questions[currentQuestionIndex];
      
      // Update question document
      const questionRef = doc(db, 'questions', currentQuestion.id);
      await updateDoc(questionRef, {
        [`votes.${option}`]: arrayUnion(user.uid)
      });
      
      // Update user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`answers.${currentQuestion.id}`]: option
      });
      
      setSelectedOption(option);
      setUserVoted(true);
      fetchResults();
    } catch (err) {
      setError('Error submitting your vote: ' + err.message);
    }
  };

  const fetchResults = async () => {
    try {
      const currentQuestion = questions[currentQuestionIndex];
      const questionDoc = await getDoc(doc(db, 'questions', currentQuestion.id));
      const questionData = questionDoc.data();
      
      const voteDataA = questionData.votes?.optionA || [];
      const voteDataB = questionData.votes?.optionB || [];
      
      const totalVotes = voteDataA.length + voteDataB.length;
      const percentA = totalVotes > 0 ? Math.round((voteDataA.length / totalVotes) * 100) : 0;
      const percentB = totalVotes > 0 ? Math.round((voteDataB.length / totalVotes) * 100) : 0;
      
      setResults({
        optionA: {
          count: voteDataA.length,
          percent: percentA
        },
        optionB: {
          count: voteDataB.length,
          percent: percentB
        },
        totalVotes
      });
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setUserVoted(false);
      setResults(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4 text-red-500 bg-red-100 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4 text-gray-600 bg-gray-100 rounded-md">
          No questions available. Please add some questions to get started.
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-8 mx-auto max-w-2xl">
        <div className="mb-4 text-right">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-md animate-fade-in">
          <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Would You Rather...</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => !userVoted && handleVote('optionA')}
              className={`w-full p-4 text-left rounded-md transition ${
                selectedOption === 'optionA'
                  ? 'bg-blue-100 border border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${userVoted && selectedOption !== 'optionA' ? 'opacity-60' : ''}`}
              disabled={userVoted}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border ${
                  selectedOption === 'optionA' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {selectedOption === 'optionA' && (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-lg font-medium text-gray-900">{currentQuestion.optionA}</p>
                  
                  {results && (
                    <div className="mt-2">
                      <div className="w-full h-4 mt-1 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${results.optionA.percent}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {results.optionA.count} votes ({results.optionA.percent}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
            
            <div className="flex items-center justify-center">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>
            
            <button
              onClick={() => !userVoted && handleVote('optionB')}
              className={`w-full p-4 text-left rounded-md transition ${
                selectedOption === 'optionB'
                  ? 'bg-blue-100 border border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              } ${userVoted && selectedOption !== 'optionB' ? 'opacity-60' : ''}`}
              disabled={userVoted}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border ${
                  selectedOption === 'optionB' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {selectedOption === 'optionB' && (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-lg font-medium text-gray-900">{currentQuestion.optionB}</p>
                  
                  {results && (
                    <div className="mt-2">
                      <div className="w-full h-4 mt-1 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${results.optionB.percent}%` }}
                        ></div>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {results.optionB.count} votes ({results.optionB.percent}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
          
          {results && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Total votes: {results.totalVotes}
            </div>
          )}
          
          {userVoted && currentQuestionIndex < questions.length - 1 && (
            <div className="mt-6 text-center">
              <button
                onClick={nextQuestion}
                className="px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Next Question
              </button>
            </div>
          )}
          
          {userVoted && currentQuestionIndex === questions.length - 1 && (
            <div className="mt-6 text-center">
              <p className="mb-2 text-gray-600">You've reached the end of all questions!</p>
              <button
                onClick={() => setCurrentQuestionIndex(0)}
                className="px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;