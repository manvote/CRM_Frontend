import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApiService } from "../services/authApi";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const response = await authApiService.signup({ email, password, fullName });
    
    // Store tokens from signup response
    if (response.data.access && response.data.refresh) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("crm_user", JSON.stringify(response.data.user));
    }

    setSuccess("Account created successfully! Redirecting...");
    
    setTimeout(() => {
      navigate("/dashboard");  // Or wherever you want to redirect
    }, 2000);
  } catch (err) {
    setError(
      err.response?.data?.detail ||
      err.response?.data?.email?.join(", ") ||
      "Signup failed."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Create Account
        </h2>
        <p className="text-sm text-gray-500">
          Enter your details to create your account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
          {success}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-500">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-500">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-500">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (minimum 8 characters)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-white bg-[#344054] rounded-xl hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-8 text-sm text-center text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-500 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Signup;
