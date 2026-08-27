import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, IconButton, TextField, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'
import { useAuth } from '../../context/AuthContext';

const textFieldSx = {
  '& .MuiInputBase-input': {
    fontSize: '14px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#fff',
    '&.Mui-focused fieldset': { borderColor: '#070707' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#070707' },
};

// Zod validation schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {login} = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');

      // Example API call integration placeholder:
      
      const response =  await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        email: data.email,
        password: data.password
      });

      localStorage.setItem('token', response.data.token);
      
      localStorage.setItem('user', JSON.stringify(response.data.user));

      login(response.data.token,response.data.user)

      console.log(response.data);
      
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen p-4" style={{ background: '#f3f3f3' }}>
      {/* Main card */}
      <div className="flex w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-white">

        {/* Left panel */}
        <div className="hidden md:flex flex-col justify-end w-[42%] relative overflow-hidden p-10" style={{ background: '#1a1a1a' }}>
          {/* Abstract orange light streaks */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background: `
                radial-gradient(ellipse 30% 50% at 40% 45%, rgba(93, 26, 108, 0.45) 0%, transparent 70%),
                radial-gradient(ellipse 20% 55% at 55% 50%, rgba(238, 0, 255, 0.3) 0%, transparent 70%),
                radial-gradient(ellipse 15% 60% at 30% 40%, rgba(98, 50, 255, 0.35) 0%, transparent 70%),
                radial-gradient(ellipse 25% 40% at 50% 55%, rgba(0, 70, 200, 0.25) 0%, transparent 70%)
              `,
            }}
          />
          {/* Dark fade at top */}
          <div
            className="absolute top-0 left-0 right-0 h-[30%] z-[2]"
            style={{ background: 'linear-gradient(to bottom, #1a1a1a, transparent)' }}
          />

          <h2 className="relative z-[3] text-white font-bold leading-tight text-3xl lg:text-4xl">
            Manage your<br />tasks with<br />ease.
          </h2>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-white flex flex-col p-6 sm:p-8 md:p-10 overflow-y-auto">
          <div className="my-auto">


            <h1 className="text-3xl font-bold text-gray-900 my-0">Welcome Back</h1>
            <p className="text-sm text-gray-400 mb-8">Sign in to your Kanban Board account</p>

            {serverError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{serverError}</Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-4 mb-7">
                <TextField
                  fullWidth
                  type="email"
                  label="Your email"
                  placeholder="you@example.com"
                  {...register("email")}
                  size=""
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={textFieldSx}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={textFieldSx}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{ background: '#070707' }}
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>

              {/* Link to register */}
              <p className="text-center text-xs text-gray-400 mt-5">
                Don't have account?{' '}
                <Link to="/register" className="text-gray-900 font-semibold underline">
                  Create new account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
