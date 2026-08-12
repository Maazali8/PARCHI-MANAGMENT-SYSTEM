import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Banknote, Calendar } from 'lucide-react';
import api from '../lib/api';
import { formatRs, todayStr, formatTime } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import type { Collection } from '../types';

export default function EmployeeCollectionsPage() {
  const [date, setDate] = useState(todayStr());
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCollections();
  }, [date]);

  const fetchMyCollections = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/collections/my?date=${date}`);
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to load my collections', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCash = collections.reduce((s, c) => s + c.cashPayment, 0);
  const totalOnline = collections.reduce((s, c) => s + c.onlinePayment, 0);
  const totalCollected = totalCash + totalOnline;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Collections Log" subtitle="Record of all recovery payments submitted by you today">
        <Link to="/employee/collections/new">
          <Button>
            <Plus size={16} /> New Collection
          </Button>
        </Link>
      </PageHeader>

      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-ink-muted" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-paper border border-cream-deep rounded-md px-3 py-1.5 text-sm font-medium text-ink focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="label-xs block">Cash Collected</span>
            <span className="amount-table text-success font-semibold">{formatRs(totalCash)}</span>
          </div>
          <div>
            <span className="label-xs block">Total Recovered</span>
            <span className="amount-table text-ink font-semibold">{formatRs(totalCollected)}</span>
          </div>
        </div>
      </Card>

      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : collections.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="No collections recorded for this date"
            description="Use the button above to record your first payment recovery."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Shopkeeper</th>
                  <th className="px-4 py-3 label-xs text-right">Parchi</th>
                  <th className="px-4 py-3 label-xs text-right">Cash</th>
                  <th className="px-4 py-3 label-xs text-right">Online</th>
                  <th className="px-4 py-3 label-xs text-right">Khata Added</th>
                  <th className="px-4 py-3 label-xs text-right">Khata Paid</th>
                  <th className="px-4 py-3 label-xs">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {collections.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{c.shopkeeper?.shopName}</td>
                    <td className="px-4 py-3 amount-table text-right">{formatRs(c.parchiAmount)}</td>
                    <td className="px-4 py-3 amount-table text-right text-success">{formatRs(c.cashPayment)}</td>
                    <td className="px-4 py-3 amount-table text-right text-success">
                      {c.onlinePayment > 0 ? formatRs(c.onlinePayment) : '-'}
                    </td>
                    <td className="px-4 py-3 amount-table text-right text-warning">
                      {c.addedToKhata > 0 ? formatRs(c.addedToKhata) : '-'}
                    </td>
                    <td className="px-4 py-3 amount-table text-right text-info">
                      {c.khataPayment > 0 ? formatRs(c.khataPayment) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{formatTime(c.createdAt)}</td>
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
