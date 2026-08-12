import { useState, useEffect } from 'react';
import { Plus, Users, Edit2, ShieldCheck, UserX } from 'lucide-react';
import api from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { User } from '../types';

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('');
    setPhone('');
    setRole('EMPLOYEE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setPassword('');
    setPhone(u.phone || '');
    setRole(u.role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || (!editingUser && !password)) {
      toast.error('Name, username, and password are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          name,
          username,
          phone,
          role,
          ...(password && { password }),
        });
        toast.success('User updated successfully');
      } else {
        await api.post('/users', {
          name,
          username,
          password,
          phone,
          role,
        });
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    try {
      await api.patch(`/users/${u.id}/status`);
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Employee Management" subtitle="Manage shop recovery staff accounts and role permissions">
        <Button onClick={handleOpenCreateModal}>
          <Plus size={16} /> Add Employee
        </Button>
      </PageHeader>

      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No staff members registered"
            action={{ label: 'Add Staff Member', onClick: handleOpenCreateModal }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Name</th>
                  <th className="px-4 py-3 label-xs">Username</th>
                  <th className="px-4 py-3 label-xs">Phone</th>
                  <th className="px-4 py-3 label-xs">Role</th>
                  <th className="px-4 py-3 label-xs">Status</th>
                  <th className="px-4 py-3 label-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-4 py-3 text-ink-light text-xs font-mono">{u.username}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{u.phone || '-'}</td>
                    <td className="px-4 py-3 text-xs">
                      {u.role === 'ADMIN' ? (
                        <Badge variant="info">Admin</Badge>
                      ) : (
                        <Badge variant="default">Employee</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="danger">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1 text-ink-light hover:text-ink transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="p-1 text-ink-muted hover:text-ink transition-colors"
                          title={u.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {u.isActive ? <UserX size={15} /> : <ShieldCheck size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingUser ? 'Save Changes' : 'Create Account'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Saleem Ahmed"
            required
          />

          <Input
            label="Username *"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. saleem"
            required
          />

          <Input
            label={editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required={!editingUser}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0321-1234567"
          />

          <Select
            label="System Role *"
            options={[
              { value: 'EMPLOYEE', label: 'Recovery Employee' },
              { value: 'ADMIN', label: 'Administrator' },
            ]}
            value={role}
            onChange={(v) => setRole(v as 'ADMIN' | 'EMPLOYEE')}
            searchable={false}
          />
        </form>
      </Modal>
    </div>
  );
}
