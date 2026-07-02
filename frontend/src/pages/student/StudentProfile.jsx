import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Key, CheckCircle, AlertTriangle } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateProfile, API_BASE } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdatingProfile(true);

    try {
      await updateProfile(profileForm);
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.message || 'Update failed');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    setUpdatingPwd(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Password update failed');
      }

      setPwdSuccess('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwdError(err.message || 'Update failed');
    } finally {
      setUpdatingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Profile</h1>
        <p className="text-slate-400 text-sm">Update your personal contact details and keep your account credentials secure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Profile Form */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
            <User className="h-5 w-5 text-brand-400" />
            <span>Profile Details</span>
          </h3>

          {profileSuccess && (
            <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-4 rounded-xl text-xs">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="flex items-center space-x-2 bg-red-950/30 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950/40 border border-slate-900 text-slate-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none placeholder-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Phone Number</label>
              <input
                type="text"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none placeholder-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4"
            >
              {updatingProfile ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-900 pb-3">
            <Key className="h-5 w-5 text-brand-400" />
            <span>Change Password</span>
          </h3>

          {pwdSuccess && (
            <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-900/60 text-emerald-400 p-4 rounded-xl text-xs">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{pwdSuccess}</span>
            </div>
          )}
          {pwdError && (
            <div className="flex items-center space-x-2 bg-red-950/30 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none placeholder-slate-600"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:outline-none placeholder-slate-600"
                placeholder="Enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPwd}
              className="w-full bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-200 font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4"
            >
              {updatingPwd ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
