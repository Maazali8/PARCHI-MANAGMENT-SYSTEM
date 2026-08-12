import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import api from '../lib/api';
import { formatRs, formatDate } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import type { Collection } from '../types';

export default function EmployeeHistoryPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collections/my');
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to load employee history', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAllTime = collections.reduce((s, c) => s + c.cashPayment + c.onlinePayment + c.khataPayment, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Recovery History" subtitle="Your complete history of collected payments" />

      <Card className="p-5 flex items-center justify-between">
        <div>
          <p className="label-xs">Total Historical Recoveries</p>
          <p className="amount-hero text-ink">{formatRs(totalAllTime)}</p>
        </div>
        <p className="text-xs text-ink-muted">{collections.length} Recoveries Completed</p>
      </Card>

      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : collections.length === 0 ? (
          <EmptyState icon={BarChart3} title="No recovery history recorded yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Date</th>
                  <th className="px-4 py-3 label-xs">Shopkeeper</th>
                  <th className="px-4 py-3 label-xs text-right">Parchi</th>
                  <th className="px-4 py-3 label-xs text-right">Cash Paid</th>
                  <th className="px-4 py-3 label-xs text-right">Online Paid</th>
                  <th className="px-4 py-3 label-xs text-right">Khata Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {collections.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-ink">{formatDate(c.date)}</td>
                    <td className="px-4 py-3 font-medium text-ink">{c.shopkeeper?.shopName}</td>
                    <td className="px-4 py-3 amount-table text-right">{formatRs(c.parchiAmount)}</td>
                    <td className="px-4 py-3 amount-table text-right text-success">{formatRs(c.cashPayment)}</td>
                    <td className="px-4 py-3 amount-table text-right text-success">
                      {c.onlinePayment > 0 ? formatRs(c.onlinePayment) : '-'}
                    </td>
                    <td className="px-4 py-3 amount-table text-right text-info">
                      {c.khataPayment > 0 ? formatRs(c.khataPayment) : '-'}
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
