import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { formatRs, formatDate } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import type { KhataBalance } from '../types';

export default function KhataPage() {
  const [khataAccounts, setKhataAccounts] = useState<KhataBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchKhata();
  }, []);

  const fetchKhata = async () => {
    try {
      setLoading(true);
      const res = await api.get('/khata');
      setKhataAccounts(res.data);
    } catch (err) {
      console.error('Failed to load khata', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = search
    ? khataAccounts.filter(
        (k) =>
          k.shopName.toLowerCase().includes(search.toLowerCase()) ||
          k.ownerName.toLowerCase().includes(search.toLowerCase())
      )
    : khataAccounts;

  const totalKhataBalance = khataAccounts.reduce((s, k) => s + (k.balance || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Khata Running Balances" subtitle="Overview of all customer credit ledger accounts" />

      {/* Summary and Filter Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="w-full sm:w-72">
          <Input
            type="text"
            placeholder="Search khata accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="text-right">
          <span className="label-xs block">Total Outstanding Khata</span>
          <span className="amount-hero text-danger">{formatRs(totalKhataBalance)}</span>
        </div>
      </Card>

      {/* Khata List Table */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No khata accounts found"
            description="Khata customers will appear here once registered with khata enabled."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Shopkeeper</th>
                  <th className="px-4 py-3 label-xs">Phone</th>
                  <th className="px-4 py-3 label-xs">Last Updated</th>
                  <th className="px-4 py-3 label-xs text-right">Running Khata Balance</th>
                  <th className="px-4 py-3 label-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {filtered.map((k) => (
                  <tr key={k.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      <Link to={`/admin/khata/${k.id}`} className="hover:underline">
                        {k.shopName}
                      </Link>
                      <div className="text-xs text-ink-muted">{k.ownerName}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-light">{k.phone || '-'}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {k.lastUpdated ? formatDate(k.lastUpdated) : 'No transactions'}
                    </td>
                    <td className="px-4 py-3 amount-table text-right">
                      <span className={k.balance > 0 ? 'text-danger font-semibold' : 'text-success'}>
                        {formatRs(k.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/khata/${k.id}`}
                        className="text-xs font-medium text-ink-light hover:text-ink inline-flex items-center gap-1"
                      >
                        View Ledger <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
