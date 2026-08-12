import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PlusCircle, MinusCircle, Printer } from 'lucide-react';
import api from '../lib/api';
import { formatRs, formatDate, formatTime } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import type { KhataEntry, Shopkeeper } from '../types';

export default function KhataDetailPage() {
  const { shopkeeperId } = useParams<{ shopkeeperId: string }>();
  const navigate = useNavigate();

  const [shopkeeper, setShopkeeper] = useState<Shopkeeper | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [entries, setEntries] = useState<KhataEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopkeeperId) fetchKhataDetails();
  }, [shopkeeperId]);

  const fetchKhataDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/khata/${shopkeeperId}`);
      setShopkeeper(res.data.shopkeeper);
      setCurrentBalance(res.data.currentBalance);
      setEntries(res.data.entries);
    } catch (err) {
      console.error('Failed to load khata details', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Khata Ledger" />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!shopkeeper) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Khata account not found"
        action={{ label: 'Back to Khata List', onClick: () => navigate('/admin/khata') }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-cream rounded-md transition-colors text-ink-light hover:text-ink cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <PageHeader title={`Khata Ledger — ${shopkeeper.shopName}`} subtitle={`Owner: ${shopkeeper.ownerName}`} />
        </div>

        <Button variant="secondary" onClick={handlePrint}>
          <Printer size={16} /> Print Ledger
        </Button>
      </div>

      {/* Header Info Banner */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-cream-warm border-cream-deep">
        <div>
          <h2 className="font-serif text-xl text-ink">{shopkeeper.shopName}</h2>
          <p className="text-sm text-ink-muted mt-0.5">Phone: {shopkeeper.phone || 'N/A'}</p>
          <p className="text-xs text-ink-muted mt-0.5">{shopkeeper.address || ''}</p>
        </div>

        <div className="text-right sm:border-l sm:border-cream-deep sm:pl-6">
          <p className="label-xs mb-1">Current Khata Balance</p>
          <p className={`amount-hero ${currentBalance > 0 ? 'text-danger' : 'text-success'}`}>
            {formatRs(currentBalance)}
          </p>
        </div>
      </Card>

      {/* Ledger History List / Timeline */}
      <Card padding={false} className="overflow-hidden">
        {entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No ledger entries found"
            description="Entries will be added automatically when parchis are added to khata or payments are received."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Date & Time</th>
                  <th className="px-4 py-3 label-xs">Description</th>
                  <th className="px-4 py-3 label-xs text-right">Debit (+) / Credit (-)</th>
                  <th className="px-4 py-3 label-xs text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {entries.map((entry) => {
                  const isAddition = entry.amount > 0;
                  return (
                    <tr key={entry.id} className="hover:bg-cream/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-ink font-medium">
                        <div>{formatDate(entry.date)}</div>
                        <div className="text-ink-muted">{formatTime(entry.createdAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-ink">
                        <div className="flex items-center gap-2">
                          {isAddition ? (
                            <PlusCircle size={16} className="text-danger flex-shrink-0" />
                          ) : (
                            <MinusCircle size={16} className="text-success flex-shrink-0" />
                          )}
                          <span>{entry.description || (isAddition ? 'Parchi added to Khata' : 'Khata Payment')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 amount-table text-right font-medium">
                        {isAddition ? (
                          <span className="text-danger">+ {formatRs(entry.amount)}</span>
                        ) : (
                          <span className="text-success">{formatRs(entry.amount)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 amount-table text-right font-semibold text-ink">
                        {formatRs(entry.balanceAfter)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
