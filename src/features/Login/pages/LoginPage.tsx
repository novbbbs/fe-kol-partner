import React, { useState } from 'react';
import { User, KeyRound, EyeOff, Eye, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validasi 4-digit username
    if (username.length !== 4 || isNaN(Number(username))) {
      setErrorMessage('Username harus berupa tepat 4 digit angka.');
      return;
    }

    setLoading(true);

    try {
      await authService.login({ username, password });
      
      // Refresh total ke halaman utama (/) agar App.tsx mendeteksi token baru
      window.location.href = '/';
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Login gagal. Periksa kembali username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#fcfcfc] overflow-hidden font-sans p-4">
      
      {/* Background Pattern Berulang (TIDAK DIUBAH/DIHILANGKAN) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-60"
        style={{ 
          backgroundImage: `url('/image/pattern.jpg')`, 
          backgroundRepeat: 'repeat', 
          backgroundSize: '2000px',    
          backgroundPosition: 'center'
        }}
      />

      {/* Container untuk Logo dan Card */}
      <div className="relative z-10 w-full max-w-[380px] flex flex-col items-center">
        
        {/* Logo Saloka Melayang */}
        <div className="mb-5 flex justify-center">
          <img 
            src="/image/saloka.png" 
            alt="Saloka Logo" 
            className="h-10 md:h-11 object-contain drop-shadow-sm"
          />
        </div>

        {/* Card Login Putih */}
        <div className="w-full bg-white dark:bg-gray-900 rounded-2xl p-7 shadow-xl border border-gray-100/80 dark:border-gray-800 space-y-3 transition-all">
          
          {/* Header dengan jarak sangat rapat dan tanpa margin bawaan berlebih */}
          <div className="text-left">
            <h1 
              className="font-bold tracking-tight whitespace-nowrap mb-0.0"
              style={{ fontSize: '17px', color: '#0d8a6a', lineHeight: '0.0' }}
            >
              Login Loka AppSys
            </h1>
            <p className="text-[12px] text-gray-400 font-normal leading-relaxed">
              Sugeng Rawuh, silahkan berikan informasi untuk akses aplikasi 👋
            </p>
          </div>

          {/* Pesan Error */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            
            {/* Input Username */}
            <div className="space-y-1">
              <label className="block text-[13px] font-medium text-gray-700 text-left">
                Username
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-500 flex items-center justify-center">
                  <User className="w-4 h-4 fill-current" />
                </div>
                <input
                  type="text"
                  maxLength={4}
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setUsername(e.target.value.replace(/\D/g, ''));
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukan username"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors placeholder:text-gray-400 text-gray-900 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="block text-[13px] font-medium text-gray-700 text-left">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-500 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 fill-current" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Masukan password"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-1 focus:ring-[#0d8a6a] focus:border-[#0d8a6a] transition-colors placeholder:text-gray-400 text-gray-900 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-800 hover:text-black focus:outline-none transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4 fill-gray-800 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Tombol Login Hijau */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0d8a6a] hover:bg-[#0a734e] active:bg-[#085a3d] text-white font-semibold text-xs rounded-xl transition-colors shadow-sm focus:outline-none mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
            
          </form>
        </div>
      </div>
      
    </div>
  );
}