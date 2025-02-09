import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PenLine, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-purple-500 max-w-3xl mx-auto flex">
        {/* Left side - Image */}
        <div className="w-1/2 relative">
          <img
            src="https://i.pinimg.com/736x/61/0f/58/610f58cadeedca4ac092e3f9dcc7e5f7.jpg"
            alt="Decorative"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right side - Login Form */}
        <div className="w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Close button */}
            <div className="flex justify-end mb-6">
              <Link to="/" className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">×</span>
              </Link>
            </div>

            {/* Logo and Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <PenLine className="h-5 w-5 text-gray-700" />
                <span className="font-medium text-gray-700">WriteWhisper</span>
              </div>
              <h2 className="text-2xl font-medium text-gray-800">Welcome back!</h2>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Email address"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-right">
                <button type="button" className="text-sm text-gray-500 hover:text-gray-700">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="mb-4">or continue with</p>
              <div className="flex justify-center gap-4">
                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <img src="https://www.facebook.com/favicon.ico" alt="Facebook" className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors">
                  <img src="https://www.apple.com/favicon.ico" alt="Apple" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Register Link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-500 hover:text-blue-600">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
