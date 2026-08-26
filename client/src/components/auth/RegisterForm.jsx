import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert, IconButton, TextField, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, PhotoCamera } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const textFieldSx = {
  '& .MuiInputBase-input': {
    fontSize: '14px', // Lowers the input text size
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px', // Lowers the label size
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: '#fff',
    '&.Mui-focused fieldset': { borderColor: '#070707' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#070707' },
};


// Zod validation schema aligned with project requirements
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name is mandatory and must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username is mandatory (min 3 chars)" }),
  email: z.string().email({ message: "Invalid email address format" }),
  contactNumber: z.string().optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function RegisterForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Handle optional profile image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('username', data.username);
      formData.append('email', data.email);
      if (data.contactNumber) formData.append('contactNumber', data.contactNumber);
      formData.append('password', data.password);
      if (profileImage) formData.append('profileImage', profileImage);

      // Example API call integration placeholder:
      const response = await axios.post('http://localhost:5000/api/auth/register', formData, {
        header: {
          'Content-Type': 'multipart/form-data',
        }
      })

      console.log("Registration Success:", response.data);

      navigate('/login');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
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

            <h1 className="text-3xl font-bold text-gray-900 my-0">Get Started</h1>
            <p className="text-sm text-gray-400 mb-6">Welcome to Kanban Board — Let's get started</p>

            {serverError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{serverError}</Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Profile image */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full border-2 border-dashed border-purple-300 bg-purple-50 flex items-center justify-center overflow-hidden shrink-0">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <PhotoCamera sx={{ fontSize: 18, color: '#070707' }} />
                  )}
                </div>
                <label className="text-sm font-medium cursor-pointer hover:text-purple-500">
                  Upload Photo (Optional)
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <div className="space-y-4 mb-6">
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="John Doe"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={textFieldSx}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="Username"
                  placeholder="johndoe"
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  sx={textFieldSx}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  type="email"
                  label="Your email"
                  placeholder="you@example.com"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={textFieldSx}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  label="Contact Number (optional)"
                  placeholder="+91 98765 43210"
                  {...register("contactNumber")}
                  error={!!errors.contactNumber}
                  helperText={errors.contactNumber?.message}
                  sx={textFieldSx}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  label="Create new password"
                  placeholder="Min. 6 characters"
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
                {isSubmitting ? 'Creating account...' : 'Create new account'}
              </button>

              {/* Link to login */}
              <p className="text-center text-xs text-gray-400 mt-5">
                Already have account?{' '}
                <Link to="/login" className="text-gray-900 font-semibold underline">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}