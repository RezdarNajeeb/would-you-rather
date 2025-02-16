import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Admin = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const questionsCollection = collection(db, 'questions');
      const questionSnapshot = await getDocs(questionsCollection);
      const questionList = questionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setQuestions(questionList);
    } catch (err) {
      setError('Error fetching questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!optionA.trim() || !optionB.trim()) {
      setError('Both options are required');
      return;
    }
    
    try {
      await addDoc(collection(db, 'questions'), {
        optionA,
        optionB,
        createdAt: serverTimestamp(),
        votes: {
          optionA: [],
          optionB: []
        }
      });
      
      setOptionA('');
      setOptionB('');
      setSuccess('Question added successfully!');
      fetchQuestions();
    } catch (err) {
      setError('Error adding question: ' + err.message);
    }
  };

  const deleteQuestion = async (id) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteDoc(doc(db, 'questions', id));
        setSuccess('Question deleted successfully!');
        fetchQuestions();
      } catch (err) {
        setError('Error deleting question: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-center">Admin Dashboard</h1>
        
        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-md">
            {success}
          </div>
        )}
        
        <div className="mb-8 overflow-hidden bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-gray-50">
            <h2 className="text-xl font-semibold">Add New Question</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Option A
                </label>
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter option A"
                />
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Option B
                </label>
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter option B"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="overflow-hidden bg-white rounded-lg shadow">
          <div className="px-6 py-4 bg-gray-50">
            <h2 className="text-xl font-semibold">Existing Questions</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <div className="w-8 h-8 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {questions.length === 0 ? (
                <p className="p-6 text-gray-500">No questions available.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Option A
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Option B
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Total Votes
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((question) => {
                      const votesA = question.votes?.optionA?.length || 0;
                      const votesB = question.votes?.optionB?.length || 0;
                      const totalVotes = votesA + votesB;
                      
                      return (
                        <tr key={question.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{question.optionA}</div>
                            <div className="text-sm text-gray-500">{votesA} votes</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{question.optionB}</div>
                            <div className="text-sm text-gray-500">{votesB} votes</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{totalVotes}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <button
                              onClick={() => deleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;