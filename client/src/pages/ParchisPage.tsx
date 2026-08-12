import { useState, useEffect } from 'react';
import { Plus, Calendar, FileText, Trash2, Edit2, CheckCircle, RotateCcw, Undo2 } from 'lucide-react';
import api from '../lib/api';
import { formatRs, todayStr } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { ParchiStatusBadge } from '../components/ui/Badge';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Parchi, Shopkeeper, User } from '../types';

export default function ParchisPage() {
  const [date, setDate] = useState(todayStr());
  const [parchis, setParchis] = useState<Parchi[]>([]);
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParchi, setEditingParchi] = useState<Parchi | null>(null);
  const [shopkeeperId, setShopkeeperId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchParchis();
  }, [date]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchParchis = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/parchis?date=${date}`);
      setParchis(res.data);
    } catch (err) {
      toast.error('Failed to load parchis');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [skRes, empRes] = await Promise.all([
        api.get('/shopkeepers'),
        api.get('/users/employees'),
      ]);
      setShopkeepers(skRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error('Failed to load dropdowns', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingParchi(null);
    setShopkeeperId('');
    setEmployeeId(employees.length > 0 ? employees[0].id : '');
    setAmount('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Parchi) => {
    if (p.collection) {
      toast.error('Cannot edit a parchi that has already been collected');
      return;
    }
    setEditingParchi(p);
    setShopkeeperId(p.shopkeeperId);
    setEmployeeId(p.employeeId);
    setAmount(p.amount.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopkeeperId || !employeeId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (editingParchi) {
        await api.put(`/parchis/${editingParchi.id}`, {
          shopkeeperId,
          employeeId,
          amount: parseFloat(amount),
          date,
        });
        toast.success('Parchi updated successfully');
      } else {
        await api.post('/parchis', {
          shopkeeperId,
          employeeId,
          amount: parseFloat(amount),
          date,
        });
        toast.success('Parchi created successfully');
      }
      setIsModalOpen(false);
      fetchParchis();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Parchi) => {
    if (p.collection) {
      toast.error('Cannot delete a parchi that has already been collected');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete parchi for ${p.shopkeeper?.shopName}?`)) return;

    try {
      await api.delete(`/parchis/${p.id}`);
      toast.success('Parchi deleted');
      fetchParchis();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleReturn = async (p: Parchi) => {
    if (!p.collection) return;
    if (!window.confirm(`Return parchi for ${p.shopkeeper?.shopName}? This will delete the collection and reset this parchi to Pending.`)) return;
    try {
      await api.delete(`/collections/${p.collection.id}`);
      toast.success('Parchi returned. It is now Pending again.');
      fetchParchis();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to return parchi');
    }
  };

  const handleUnreturn = async (p: Parchi) => {
    if (!window.confirm(`Undo return for ${p.shopkeeper?.shopName}? This will reset the parchi back to Pending so it can be collected again.`)) return;
    try {
      await api.patch(`/parchis/${p.id}/unreturn`);
      toast.success('Parchi reset to Pending.');
      fetchParchis();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to undo return');
    }
  };

  const totalDayAmount = parchis.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Daily Parchi" subtitle="Create and assign recovery slips for shopkeepers">
        <Button onClick={handleOpenCreateModal}>
          <Plus size={16} /> Create Parchi
        </Button>
      </PageHeader>

      {/* Date Filter Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-ink-muted" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-paper border border-cream-deep rounded-md px-3 py-1.5 text-sm font-medium text-ink focus:outline-none focus:border-ink"
          />
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="label-xs block">Total Slips</span>
            <span className="font-semibold text-ink">{parchis.length}</span>
          </div>
          <div>
            <span className="label-xs block">Total Amount</span>
            <span className="amount-table text-ink font-semibold">{formatRs(totalDayAmount)}</span>
          </div>
        </div>
      </Card>

      {/* Parchis Table */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : parchis.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No parchis created for this date"
            description="Select a different date or create a new parchi slip above."
            action={{ label: 'Create Parchi', onClick: handleOpenCreateModal }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Shopkeeper</th>
                  <th className="px-4 py-3 label-xs text-right">Parchi Amount</th>
                  <th className="px-4 py-3 label-xs">Assigned Employee</th>
                  <th className="px-4 py-3 label-xs">Status</th>
                  <th className="px-4 py-3 label-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {parchis.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      <div>{p.shopkeeper?.shopName}</div>
                      <div className="text-xs text-ink-muted">{p.shopkeeper?.ownerName}</div>
                      {p.status === 'RETURNED' && p.returnReason && (
                        <div className="text-xs text-danger/80 mt-0.5 flex items-center gap-1">
                          <Undo2 size={11} />
                          {p.returnReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 amount-table text-right">{formatRs(p.amount)}</td>
                    <td className="px-4 py-3 text-ink-light text-xs font-medium">{p.employee?.name}</td>
                    <td className="px-4 py-3">
                      <ParchiStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!p.collection && p.status !== 'RETURNED' ? (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1 text-ink-light hover:text-ink transition-colors"
                              title="Edit Parchi"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="p-1 text-danger/70 hover:text-danger transition-colors"
                              title="Delete Parchi"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : p.status === 'RETURNED' ? (
                          // RETURNED — admin can undo the return
                          <button
                            onClick={() => handleUnreturn(p)}
                            className="p-1 text-info/80 hover:text-info transition-colors"
                            title="Undo Return — reset to Pending"
                          >
                            <RotateCcw size={14} />
                          </button>
                        ) : (
                          // Has a collection
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-success flex items-center gap-1">
                              <CheckCircle size={14} /> Collected
                            </span>
                            <button
                              onClick={() => handleReturn(p)}
                              className="p-1 text-danger/60 hover:text-danger transition-colors"
                              title="Return Parchi (undo collection)"
                            >
                              <RotateCcw size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParchi ? 'Edit Parchi' : 'Create Daily Parchi'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingParchi ? 'Save Changes' : 'Create Parchi'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Shopkeeper *"
            options={shopkeepers.map((sk) => ({
              value: sk.id,
              label: sk.shopName,
              sublabel: `${sk.ownerName} ${sk.hasKhata ? '• Khata Customer' : ''}`,
            }))}
            value={shopkeeperId}
            onChange={setShopkeeperId}
            placeholder="Select shopkeeper..."
            disabled={!!editingParchi}
          />

          <Input
            label="Parchi Amount (Rs.) *"
            type="number"
            isAmount
            prefix="Rs."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            required
          />

          <Select
            label="Assign Employee *"
            options={employees.map((emp) => ({
              value: emp.id,
              label: emp.name,
            }))}
            value={employeeId}
            onChange={setEmployeeId}
            placeholder="Select recovery employee..."
          />
        </form>
      </Modal>
    </div>
  );
}
