import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Store, Edit2, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { formatRs } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Shopkeeper } from '../types';

export default function ShopkeepersPage() {
  const [shopkeepers, setShopkeepers] = useState<Shopkeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [hasKhataFilter, setHasKhataFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSk, setEditingSk] = useState<Shopkeeper | null>(null);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [hasKhata, setHasKhata] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchShopkeepers();
  }, []);

  const fetchShopkeepers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shopkeepers');
      setShopkeepers(res.data);
    } catch (err) {
      toast.error('Failed to load shopkeepers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSk(null);
    setShopName('');
    setOwnerName('');
    setPhone('');
    setAddress('');
    setNotes('');
    setHasKhata(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sk: Shopkeeper, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSk(sk);
    setShopName(sk.shopName);
    setOwnerName(sk.ownerName);
    setPhone(sk.phone || '');
    setAddress(sk.address || '');
    setNotes(sk.notes || '');
    setHasKhata(sk.hasKhata);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName) {
      toast.error('Shop name and Owner name are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingSk) {
        await api.put(`/shopkeepers/${editingSk.id}`, {
          shopName,
          ownerName,
          phone,
          address,
          notes,
          hasKhata,
        });
        toast.success('Shopkeeper updated');
      } else {
        await api.post('/shopkeepers', {
          shopName,
          ownerName,
          phone,
          address,
          notes,
          hasKhata,
        });
        toast.success('Shopkeeper created');
      }
      setIsModalOpen(false);
      fetchShopkeepers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = shopkeepers.filter((sk) => {
    const matchesSearch =
      sk.shopName.toLowerCase().includes(search.toLowerCase()) ||
      sk.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      (sk.phone && sk.phone.includes(search));

    if (hasKhataFilter === 'khata') return matchesSearch && sk.hasKhata;
    if (hasKhataFilter === 'daily') return matchesSearch && !sk.hasKhata;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Shopkeeper Directory" subtitle="Manage registered hardware customers and khata accounts">
        <Button onClick={handleOpenCreateModal}>
          <Plus size={16} /> Add Shopkeeper
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder="Search by shop, owner, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setHasKhataFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              hasKhataFilter === 'all' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
            }`}
          >
            All ({shopkeepers.length})
          </button>
          <button
            onClick={() => setHasKhataFilter('khata')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              hasKhataFilter === 'khata' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
            }`}
          >
            Khata Customers
          </button>
          <button
            onClick={() => setHasKhataFilter('daily')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              hasKhataFilter === 'daily' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
            }`}
          >
            Daily Payment
          </button>
        </div>
      </Card>

      {/* Shopkeepers Grid / Table */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No shopkeepers found"
            description="Add your first customer shopkeeper to start assigning parchis."
            action={{ label: 'Add Shopkeeper', onClick: handleOpenCreateModal }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Shop & Owner</th>
                  <th className="px-4 py-3 label-xs">Phone</th>
                  <th className="px-4 py-3 label-xs">Address</th>
                  <th className="px-4 py-3 label-xs">Account Type</th>
                  <th className="px-4 py-3 label-xs text-right">Khata Balance</th>
                  <th className="px-4 py-3 label-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {filtered.map((sk) => (
                  <tr key={sk.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link to={`/admin/shopkeepers/${sk.id}`} className="hover:underline flex items-center gap-1.5">
                        {sk.shopName}
                      </Link>
                      <div className="text-xs text-ink-muted">{sk.ownerName}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-light">{sk.phone || '-'}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted max-w-xs truncate">{sk.address || '-'}</td>
                    <td className="px-4 py-3 text-xs">
                      {sk.hasKhata ? (
                        <span className="text-info font-medium">Khata Account</span>
                      ) : (
                        <span className="text-ink-muted">Daily Payment</span>
                      )}
                    </td>
                    <td className="px-4 py-3 amount-table text-right">
                      {sk.hasKhata ? (
                        <span className={(sk.khataBalance || 0) > 0 ? 'text-danger font-semibold' : 'text-success'}>
                          {formatRs(sk.khataBalance || 0)}
                        </span>
                      ) : (
                        <span className="text-ink-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => handleOpenEditModal(sk, e)}
                          className="p-1 text-ink-light hover:text-ink transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <Link to={`/admin/shopkeepers/${sk.id}`}>
                          <Button size="sm" variant="ghost">
                            View <ArrowRight size={14} />
                          </Button>
                        </Link>
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
        title={editingSk ? 'Edit Shopkeeper' : 'Add New Shopkeeper'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingSk ? 'Save Changes' : 'Create Shopkeeper'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Shop Name *"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="e.g. Ahmad Hardware"
            required
          />

          <Input
            label="Owner Name *"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="e.g. Ahmad Ali"
            required
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 0300-1234567"
          />

          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Main Market, Shop #12"
          />

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="hasKhata"
              checked={hasKhata}
              onChange={(e) => setHasKhata(e.target.checked)}
              className="w-4 h-4 text-ink rounded border-cream-deep focus:ring-ink"
            />
            <label htmlFor="hasKhata" className="text-sm font-medium text-ink cursor-pointer select-none">
              Enable Khata Running Balance Account
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label">Notes / Remarks</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full bg-paper border border-cream-deep rounded-md p-3 text-sm focus:outline-none focus:border-ink"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
