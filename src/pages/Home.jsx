import { Link } from 'react-router-dom';

const Home = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600">
      <div className="container px-4 py-16 mx-auto text-center text-white">
        <h1 className="mb-4 text-4xl font-extrabold sm:text-5xl md:text-6xl">
          Would You Rather?
        </h1>
        <p className="mb-8 text-xl">
          The ultimate game of impossible choices and hilarious dilemmas!
        </p>
        
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
            <p className="mb-4 text-lg">
              Choose between two equally absurd, difficult, or hilarious options.
              See how your answers compare with others!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          {user ? (
            <Link
              to="/game"
              className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-200"
            >
              Start Playing
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-200"
            >
              Sign In to Play
            </Link>
          )}
          
          {/* Add more buttons/links as needed */}
        </div>
      </div>
      
      <div className="container px-4 py-16 mx-auto">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Feature cards */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">Endless Questions</h2>
            <p className="text-gray-600">
              Hundreds of thought-provoking and hilarious dilemmas to choose from.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">See How Others Voted</h2>
            <p className="text-gray-600">
              Compare your choices with players from around the world.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">Play Anywhere</h2>
            <p className="text-gray-600">
              Our responsive design works on all devices - play on your phone, tablet, or computer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;