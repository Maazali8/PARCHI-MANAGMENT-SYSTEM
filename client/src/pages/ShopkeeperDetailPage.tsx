import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Store, Banknote } from 'lucide-react';
import api from '../lib/api';
import { formatRs, formatDate } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import type { Shopkeeper, Collection } from '../types';

export default function ShopkeeperDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shopkeeper, setShopkeeper] = useState<Shopkeeper | null>(null);
  const [history, setHistory] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [skRes, hxRes] = await Promise.all([
        api.get(`/shopkeepers/${id}`),
        api.get(`/shopkeepers/${id}/history`),
      ]);
      setShopkeeper(skRes.data);
      setHistory(hxRes.data);
    } catch (err) {
      console.error('Failed to load shopkeeper details', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Shopkeeper Profile" />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!shopkeeper) {
    return (
      <EmptyState
        icon={Store}
        title="Shopkeeper not found"
        action={{ label: 'Back to Directory', onClick: () => navigate('/admin/shopkeepers') }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-cream rounded-md transition-colors text-ink-light hover:text-ink cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <PageHeader title={shopkeeper.shopName} subtitle={`Owner: ${shopkeeper.ownerName}`} />
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="label-xs mb-1">Contact Information</p>
          <p className="text-sm font-medium text-ink">{shopkeeper.phone || 'No phone recorded'}</p>
          <p className="text-xs text-ink-muted mt-1">{shopkeeper.address || 'No address recorded'}</p>
        </Card>

        <Card className="p-5">
          <p className="label-xs mb-1">Account Configuration</p>
          <p className="text-sm font-medium text-ink">
            {shopkeeper.hasKhata ? (
              <span className="text-info">Khata Running Balance Account</span>
            ) : (
              <span>Daily Payment Account</span>
            )}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {shopkeeper.hasKhata ? 'Supports partial payments & running balance' : 'Slips are settled on daily basis'}
          </p>
        </Card>

        <Card className="p-5">
          <p className="label-xs mb-1">Current Khata Balance</p>
          <p className={`amount-hero ${(shopkeeper.khataBalance || 0) > 0 ? 'text-danger' : 'text-success'}`}>
            {formatRs(shopkeeper.khataBalance || 0)}
          </p>
          {shopkeeper.hasKhata && (
            <Link to={`/admin/khata/${shopkeeper.id}`} className="text-xs text-ink-light hover:text-ink font-medium mt-1 inline-block">
              View Khata Ledger →
            </Link>
          )}
        </Card>
      </div>

      {/* History Table */}
      <div>
        <h2 className="text-lg font-serif mb-4">Transaction & Recovery History</h2>
        <Card padding={false} className="overflow-hidden">
          {history.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="No transactions recorded"
              description="This customer does not have any recorded collection history yet."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream border-b border-cream-deep">
                  <tr>
                    <th className="px-4 py-3 label-xs">Date</th>
                    <th className="px-4 py-3 label-xs text-right">Parchi Amount</th>
                    <th className="px-4 py-3 label-xs text-right">Discount/Adj</th>
                    <th className="px-4 py-3 label-xs text-right">Cash Paid</th>
                    <th className="px-4 py-3 label-xs text-right">Online Paid</th>
                    <th className="px-4 py-3 label-xs text-right">Added to Khata</th>
                    <th className="px-4 py-3 label-xs text-right">Old Khata Paid</th>
                    <th className="px-4 py-3 label-xs">Collector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-deep">
                  {history.map((col) => (
                    <tr key={col.id} className="hover:bg-cream/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-ink">{formatDate(col.date)}</td>
                      <td className="px-4 py-3 amount-table text-right">{formatRs(col.parchiAmount)}</td>
                      <td className="px-4 py-3 amount-table text-right text-warning">
                        {col.discount + col.goodsAdjustment > 0 ? (
                          `- ${formatRs(col.discount + col.goodsAdjustment)}`
                        ) : (
                          <span className="text-ink-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 amount-table text-right text-success">{formatRs(col.cashPayment)}</td>
                      <td className="px-4 py-3 amount-table text-right text-success">
                        {col.onlinePayment > 0 ? formatRs(col.onlinePayment) : <span className="text-ink-muted">-</span>}
                      </td>
                      <td className="px-4 py-3 amount-table text-right text-warning">
                        {col.addedToKhata > 0 ? formatRs(col.addedToKhata) : <span className="text-ink-muted">-</span>}
                      </td>
                      <td className="px-4 py-3 amount-table text-right text-info">
                        {col.khataPayment > 0 ? formatRs(col.khataPayment) : <span className="text-ink-muted">-</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink-light">{col.collectedBy?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
