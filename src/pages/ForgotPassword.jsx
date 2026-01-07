import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-sm">Enter your email and we'll send you a link to reset your password</p>
      </div>

      <form className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-500 pl-1">Email</label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
             <img 
              src="/src/assets/mail.svg"
              alt="Email" 
              className="absolute w-5 h-5 -translate-y-1/2 right-3 top-1/2 opacity-60"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#344054] text-white py-3.5 rounded-xl font-medium hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg shadow-gray-900/20"
        >
            Send Reset Link
        </button>
      </form>

      <div className="flex justify-center mt-8">
        <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:underline">
           <ArrowLeft size={16} />
           Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
