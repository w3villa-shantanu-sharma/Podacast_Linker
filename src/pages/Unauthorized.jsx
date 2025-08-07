import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-2xl text-error">Access Denied</h2>
          <div className="text-6xl my-4">🔒</div>
          <p>
            You don't have permission to access this area. This section requires admin privileges.
          </p>
          <div className="card-actions justify-center mt-6">
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}