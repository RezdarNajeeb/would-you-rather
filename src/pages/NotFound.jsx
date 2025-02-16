import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-extrabold text-gray-900">404</h1>
        <p className="mb-6 text-2xl font-medium text-gray-600">Page not found</p>
        <p className="mb-8 text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;