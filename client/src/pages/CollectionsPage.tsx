import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Banknote, Calendar, X, User, FileText, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';
import api from '../lib/api';
import { formatRs, todayStr, formatDate, formatTime } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { VerificationBadge } from '../components/ui/Badge';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Collection } from '../types';

// â”€â”€ Collection Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CollectionDetailModal({
  collection,
  onClose,
  onReturn,
  returning,
}: {
  collection: Collection;
  onClose: () => void;
  onReturn: (id: string) => void;
  returning: boolean;
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-deep">
          <div>
            <h3 className="font-serif text-xl">{collection.shopkeeper?.shopName}</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {formatDate(collection.date)} Â· {formatTime(collection.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-cream rounded transition-colors cursor-pointer">
            <X size={18} className="text-ink-muted" />
          </button>
        </div>

        {/* Body */}
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

          {/* Settlement breakdown */}
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
              <AlertCircle size={15} /> Online payment pending admin verification
            </div>
          )}
          {collection.onlinePayment > 0 && collection.onlineVerified && (
            <div className="flex items-center gap-2 bg-success-bg rounded-md p-3 text-sm text-success">
              <CheckCircle size={15} /> Online payment verified
            </div>
          )}

          {/* Return Parchi Warning */}
          <div className="bg-danger-bg border border-danger/20 rounded-md p-3">
            <p className="text-xs text-danger font-medium mb-1">Return / Reverse this Collection</p>
            <p className="text-xs text-ink-light">
              This will delete the collection record, reset the parchi back to Pending, and reverse any khata entries.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cream-deep flex justify-between">
          <Button
            variant="danger"
            size="sm"
            loading={returning}
            onClick={() => onReturn(collection.id)}
          >
            <RotateCcw size={14} /> Return Parchi
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ Collections Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CollectionsPage() {
  const [date, setDate] = useState(todayStr());
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [returning, setReturning] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, [date]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/collections?date=${date}`);
      setCollections(res.data);
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (collectionId: string) => {
    if (!window.confirm('Return this parchi? This will delete the collection and reset the parchi to Pending. Any khata changes will be reversed.')) return;
    try {
      setReturning(true);
      await api.delete(`/collections/${collectionId}`);
      toast.success('Parchi returned successfully. It is now Pending again.');
      setSelectedCollection(null);
      fetchCollections();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to return parchi');
    } finally {
      setReturning(false);
    }
  };

  const filtered = search
    ? collections.filter((c) =>
        c.shopkeeper?.shopName.toLowerCase().includes(search.toLowerCase()) ||
        c.collectedBy?.name.toLowerCase().includes(search.toLowerCase())
      )
    : collections;

  const totalCollected = collections.reduce((s, c) => s + c.cashPayment + c.onlinePayment + c.khataPayment, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Collections Log" subtitle="History of all payments recovered by employees">
        <Link to="/admin/collections/new">
          <Button>
            <Plus size={16} /> Enter Collection
          </Button>
        </Link>
      </PageHeader>

      {/* Filter and Summary Bar */}
      <Card className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-ink-muted" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-paper border border-cream-deep rounded-md px-3 py-1.5 text-sm font-medium text-ink focus:outline-none focus:border-ink"
            />
          </div>
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search shopkeeper or employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="text-right">
          <span className="label-xs block">Day's Total Recovered</span>
          <span className="amount-table text-ink font-semibold">{formatRs(totalCollected)}</span>
        </div>
      </Card>

      {/* Collections Table */}
      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton rows={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="No collections found"
            description="No recovery records found for the selected date or search filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Shopkeeper</th>
                  <th className="px-4 py-3 label-xs text-right">Parchi</th>
                  <th className="px-4 py-3 label-xs text-right">Discount/Adj</th>
                  <th className="px-4 py-3 label-xs text-right">Cash</th>
                  <th className="px-4 py-3 label-xs text-right">Online</th>
                  <th className="px-4 py-3 label-xs text-right">Added to Khata</th>
                  <th className="px-4 py-3 label-xs text-right">Khata Paid</th>
                  <th className="px-4 py-3 label-xs">Employee</th>
                  <th className="px-4 py-3 label-xs">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCollection(c)}
                    className="hover:bg-cream/70 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      <div>{c.shopkeeper?.shopName}</div>
                      {c.notes && (
                        <div className="text-xs text-ink-muted truncate max-w-[140px]">Notes: {c.notes}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 amount-table text-right">{formatRs(c.parchiAmount)}</td>
                    <td className="px-4 py-3 amount-table text-right text-warning">
                      {c.discount + c.goodsAdjustment > 0 ? (
                        `- ${formatRs(c.discount + c.goodsAdjustment)}`
                      ) : (
                        <span className="text-ink-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 amount-table text-right text-success">{formatRs(c.cashPayment)}</td>
                    <td className="px-4 py-3 amount-table text-right">
                      {c.onlinePayment > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          {formatRs(c.onlinePayment)}
                          <VerificationBadge verified={c.onlineVerified} />
                        </span>
                      ) : (
                        <span className="text-ink-muted">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 amount-table text-right text-warning">
                      {c.addedToKhata > 0 ? formatRs(c.addedToKhata) : <span className="text-ink-muted">-</span>}
                    </td>
                    <td className="px-4 py-3 amount-table text-right text-info">
                      {c.khataPayment > 0 ? formatRs(c.khataPayment) : <span className="text-ink-muted">-</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-light">{c.collectedBy?.name}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{formatTime(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedCollection && (
        <CollectionDetailModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
          onReturn={handleReturn}
          returning={returning}
        />
      )}
    </div>
  );
}
