import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote, Clock, Plus, ArrowRight, X, Calendar,
  User, FileText, TrendingDown, CheckCircle, AlertCircle,
} from 'lucide-react';
import api from '../lib/api';
import { formatRs, formatDate, formatTime } from '../lib/utils';
import { StatCard, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { VerificationBadge } from '../components/ui/Badge';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import type { AdminDashboard as AdminDashboardType, Collection } from '../types';

function CollectionDetailModal({
  collection,
  onClose,
}: {
  collection: Collection;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className="relative bg-paper rounded-xl w-full max-w-md max-h-[90vh] flex flex-col animate-modal shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-deep">
          <div>
            <h3 className="font-serif text-xl">{collection.shopkeeper?.shopName}</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {formatDate(collection.date)} &middot; {formatTime(collection.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-cream rounded transition-colors cursor-pointer">
            <X size={18} className="text-ink-muted" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-cream rounded-md p-3">
              <p className="label-xs mb-1">Collected By</p>
              <p className="text-sm font-medium flex items-center gap-1.5 text-ink">
                <User size={13} className="text-ink-muted" />
                {collection.collectedBy?.name}
              </p>
            </div>
            <div className="bg-cream rounded-md p-3">
              <p className="label-xs mb-1">Date</p>
              <p className="text-sm font-medium flex items-center gap-1.5 text-ink">
                <Calendar size={13} className="text-ink-muted" />
                {formatDate(collection.date)}
              </p>
            </div>
          </div>
          <div className="bg-ink rounded-lg p-4 space-y-2.5">
            <p className="label-xs text-paper/50 mb-3">Settlement Breakdown</p>
            <div className="flex justify-between text-sm">
              <span className="text-paper/70">Original Parchi</span>
              <span className="amount-table text-paper">{formatRs(collection.parchiAmount)}</span>
            </div>
            {collection.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-paper/70">Discount</span>
                <span className="amount-table text-warning">- {formatRs(collection.discount)}</span>
              </div>
            )}
            {collection.goodsAdjustment > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-paper/70">Goods Adjustment</span>
                <span className="amount-table text-warning">- {formatRs(collection.goodsAdjustment)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-paper/10 pt-2">
              <span className="text-paper font-semibold">Net Payable</span>
              <span className="amount-table text-paper font-semibold">{formatRs(collection.netParchiAmount)}</span>
            </div>
            {collection.cashPayment > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-paper/70">Cash Received</span>
                <span className="amount-table text-success">{formatRs(collection.cashPayment)}</span>
              </div>
            )}
            {collection.onlinePayment > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-paper/70">Online ({collection.onlineMethod || 'Online'})</span>
                <span className="amount-table text-success flex items-center gap-2">
                  {formatRs(collection.onlinePayment)}
                  <VerificationBadge verified={collection.onlineVerified} />
                </span>
              </div>
            )}
            {collection.addedToKhata > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-paper/70">Added to Khata</span>
                <span className="amount-table text-warning">{formatRs(collection.addedToKhata)}</span>
              </div>
            )}
            {collection.khataPayment > 0 && (
              <div className="flex justify-between text-sm border-t border-paper/10 pt-2">
                <span className="text-paper/70">Old Khata Payment</span>
                <span className="amount-table text-info">{formatRs(collection.khataPayment)}</span>
              </div>
            )}
          </div>
          {collection.discountReason && (
            <div className="border border-cream-deep rounded-md p-3">
              <p className="label-xs mb-1">Discount Reason</p>
              <p className="text-sm text-ink">{collection.discountReason}</p>
            </div>
          )}
          {collection.goodsDescription && (
            <div className="border border-cream-deep rounded-md p-3">
              <p className="label-xs mb-1">Goods Adjustment Description</p>
              <p className="text-sm text-ink">{collection.goodsDescription}</p>
            </div>
          )}
          {collection.notes && (
            <div className="border border-cream-deep rounded-md p-3">
              <p className="label-xs mb-1 flex items-center gap-1">
                <FileText size={11} /> Notes
              </p>
              <p className="text-sm text-ink whitespace-pre-wrap">{collection.notes}</p>
            </div>
          )}
          {collection.onlinePayment > 0 && !collection.onlineVerified && (
            <div className="flex items-center gap-2 bg-warning-bg border border-warning/30 rounded-md p-3 text-sm text-warning">
              <AlertCircle size={15} />
              Online payment pending admin verification
            </div>
          )}
          {collection.onlinePayment > 0 && collection.onlineVerified && (
            <div className="flex items-center gap-2 bg-success-bg rounded-md p-3 text-sm text-success">
              <CheckCircle size={15} />
              Online payment verified
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-cream-deep flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of daily recovery and collections" />
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="Dashboard" subtitle={todayLabel}>
        <Link to="/admin/parchis">
          <Button variant="secondary" size="sm">
            <Plus size={16} /> New Parchi
          </Button>
        </Link>
        <Link to="/admin/collections/new">
          <Button size="sm">
            <Banknote size={16} /> Enter Collection
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Collection"
          value={formatRs(data?.todayTotal || 0)}
          change={
            data?.yesterdayTotal
              ? {
                  value: Math.round((((data.todayTotal || 0) - data.yesterdayTotal) / data.yesterdayTotal) * 100),
                  label: 'vs yesterday',
                }
              : undefined
          }
        />
        <StatCard label="Yesterday's Collection" value={formatRs(data?.yesterdayTotal || 0)} />
        <StatCard label="Monthly Collection" value={formatRs(data?.monthTotal || 0)} />
        <StatCard label="Total Current Khata" value={formatRs(data?.totalKhata || 0)} />
      </div>

      {(data?.pendingVerifications || 0) > 0 && (
        <Card className="bg-warning-bg border-warning/30 flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-warning/20 flex items-center justify-center text-warning">
              <Clock size={20} />
            </div>
            <div>
              <p className="font-medium text-ink text-sm">
                {data?.pendingVerifications} Online Payment{data?.pendingVerifications! > 1 ? 's' : ''} Pending Verification
              </p>
              <p className="text-xs text-ink-light">Verify online transactions to confirm recovery</p>
            </div>
          </div>
          <Link to="/admin/verify">
            <Button size="sm" variant="secondary">Review Now <ArrowRight size={14} /></Button>
          </Link>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg">Recent Collections</h2>
            <p className="text-xs text-ink-muted mt-0.5">Click any row to view full details</p>
          </div>
          <Link to="/admin/collections" className="text-xs text-ink-light hover:text-ink font-medium flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <Card padding={false} className="overflow-hidden">
          {!data?.recentCollections || data.recentCollections.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="No collections recorded today"
              description="Collections will appear here as employees submit recoveries."
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
                    <th className="px-4 py-3 label-xs text-right">
                      <TrendingDown size={11} className="inline mr-1" />Discount/Adj
                    </th>
                    <th className="px-4 py-3 label-xs">Collected By</th>
                    <th className="px-4 py-3 label-xs">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-deep">
                  {data.recentCollections.map((col) => (
                    <tr
                      key={col.id}
                      onClick={() => setSelectedCollection(col)}
                      className="hover:bg-cream/70 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-ink">
                        <div>{col.shopkeeper?.shopName}</div>
                        {col.notes && (
                          <div className="text-xs text-ink-muted truncate max-w-[160px]">Notes: {col.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 amount-table text-right">{formatRs(col.parchiAmount)}</td>
                      <td className="px-4 py-3 amount-table text-right text-success">{formatRs(col.cashPayment)}</td>
                      <td className="px-4 py-3 amount-table text-right">
                        {col.onlinePayment > 0 ? (
                          <span className="flex items-center justify-end gap-1">
                            {formatRs(col.onlinePayment)}
                            <VerificationBadge verified={col.onlineVerified} />
                          </span>
                        ) : (
                          <span className="text-ink-muted">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 amount-table text-right text-warning">
                        {col.addedToKhata > 0 ? formatRs(col.addedToKhata) : <span className="text-ink-muted">-</span>}
                      </td>
                      <td className="px-4 py-3 amount-table text-right text-warning">
                        {(col.discount + col.goodsAdjustment) > 0
                          ? `- ${formatRs(col.discount + col.goodsAdjustment)}`
                          : <span className="text-ink-muted">-</span>}
                      </td>
                      <td className="px-4 py-3 text-ink-light text-xs">{col.collectedBy?.name}</td>
                      <td className="px-4 py-3 text-ink-muted text-xs">{formatTime(col.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
        />
      )}
    </div>
  );
}
