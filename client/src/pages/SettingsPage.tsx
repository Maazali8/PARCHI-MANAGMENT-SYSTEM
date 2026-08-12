import { useState } from 'react';
import { Lock } from 'lucide-react';
import api from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/EmptyState';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Account Settings" subtitle="Manage your security preferences and user profile" />

      {/* User Profile Summary */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-3 border-b border-cream-deep pb-3">
          <div className="w-10 h-10 rounded-full bg-cream-warm flex items-center justify-center text-ink font-serif text-lg">
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <h3 className="font-serif text-lg">{user?.name}</h3>
            <p className="text-xs text-ink-muted">Username: @{user?.username}</p>
          </div>
        </div>

        <div className="flex justify-between text-xs text-ink-light">
          <span>Role: <strong className="text-ink">{user?.role}</strong></span>
          <span>Status: <strong className="text-success">Active</strong></span>
        </div>
      </Card>

      {/* Change Password Form */}
      <Card className="p-6 space-y-4">
        <h3 className="font-serif text-lg flex items-center gap-2">
          <Lock size={18} /> Change Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password *"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="New Password *"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirm New Password *"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
