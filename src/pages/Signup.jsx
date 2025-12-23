import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-sm text-gray-500">Enter your details to create your account</p>
      </div>

      <form className="space-y-5">
        {/* Name Input */}
        <div className="space-y-1.5">
            <label className="block pl-1 text-sm font-medium text-gray-500">Full Name</label>
            <input
            type="text"
            required
            placeholder="Enter your full name"
            className="w-full px-4 py-3 transition-all duration-200 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="block pl-1 text-sm font-medium text-gray-500">Email</label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className="w-full px-4 py-3 pr-10 transition-all duration-200 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <img 
              src="/src/assets/mail.svg"
              alt="Email" 
              className="absolute w-5 h-5 -translate-y-1/2 right-3 top-1/2 opacity-60"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="block pl-1 text-sm font-medium text-gray-500">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Create a password"
              className="w-full px-4 py-3 pr-10 transition-all duration-200 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute -translate-y-1/2 right-3 top-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3.5 text-white transition-colors duration-200 bg-[#344054] rounded-xl font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-lg shadow-gray-900/20"
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2 relative">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center gap-4">
            {/* Google */}
            <button type="button" className="flex items-center justify-center w-12 h-12 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50">
                <img src="/src/assets/google.svg" alt="Google" className="w-6 h-6" />
            </button>

            {/* Apple */}
            <button type="button" className="flex items-center justify-center w-12 h-12 text-gray-900 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50">
                <img src="/src/assets/apple.svg" alt="Apple" className="w-6 h-6" />
            </button>

            {/* LinkedIn */}
            <button type="button" className="flex items-center justify-center w-12 h-12 text-[#0077b5] transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50">
                <img src="/src/assets/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
            </button>

            {/* Microsoft */}
            <button type="button" className="flex items-center justify-center w-12 h-12 transition-colors duration-200 border border-gray-200 rounded-xl hover:bg-gray-50">
               <img src="/src/assets/microsoft.svg" alt="Microsoft" className="w-6 h-6" />
            </button>
        </div>
      </form>

      <p className="mt-8 text-sm text-center text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Signup;
