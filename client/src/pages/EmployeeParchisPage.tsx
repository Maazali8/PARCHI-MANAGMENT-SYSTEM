import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle, Calendar, Undo2, X, AlertTriangle } from 'lucide-react';
import api from '../lib/api';
import { formatRs, todayStr } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ParchiStatusBadge } from '../components/ui/Badge';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Parchi } from '../types';

// ── Return Reason Dialog ────────────────────────────────────────────────────
const QUICK_REASONS = [
  'Shop Closed',
  'Owner Not Available',
  'Refused Payment',
  'Will Pay Tomorrow',
  'Other',
];

function ReturnReasonDialog({
  parchi,
  onClose,
  onSuccess,
}: {
  parchi: Parchi;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const finalReason = reason === 'Other' ? customReason.trim() : reason;

  const handleSubmit = async () => {
    if (!finalReason) {
      toast.error('Please select or enter a return reason');
      return;
    }
    try {
      setSubmitting(true);
      await api.patch(`/parchis/${parchi.id}/return`, { returnReason: finalReason });
      toast.success('Parchi marked as returned');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to return parchi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div className="relative bg-paper rounded-xl w-full max-w-sm flex flex-col animate-modal shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-deep">
          <div>
            <h3 className="font-serif text-lg">Return Parchi</h3>
            <p className="text-xs text-ink-muted mt-0.5">{parchi.shopkeeper?.shopName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-cream rounded transition-colors cursor-pointer">
            <X size={16} className="text-ink-muted" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Warning info bar */}
          <div className="flex items-start gap-2 bg-warning-bg border border-warning/30 rounded-md p-3 text-sm text-warning">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <p>This will mark the parchi as <strong>Returned</strong>. No collection will be recorded. Admin can undo this if needed.</p>
          </div>

          {/* Quick-select chips */}
          <div>
            <p className="label-xs mb-2">Select a reason *</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    reason === r
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-paper text-ink-light border-cream-deep hover:border-ink hover:text-ink'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason input (shown when "Other" selected) */}
          {reason === 'Other' && (
            <div>
              <label className="label">Describe the reason *</label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explain why the parchi is being returned..."
                rows={2}
                autoFocus
                className="w-full bg-paper border border-cream-deep rounded-md p-3 text-sm focus:outline-none focus:border-ink mt-1"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-cream-deep flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm"
            variant="danger"
            loading={submitting}
            onClick={handleSubmit}
            // @ts-ignore - disable is valid
            disabled={!finalReason}
          >
            <Undo2 size={14} /> Confirm Return
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Employee Parchis Page ───────────────────────────────────────────────────
export default function EmployeeParchisPage() {
  const [date, setDate] = useState(todayStr());
  const [parchis, setParchis] = useState<Parchi[]>([]);
  const [loading, setLoading] = useState(true);
  const [returningParchi, setReturningParchi] = useState<Parchi | null>(null);

  useEffect(() => {
    fetchMyParchis();
  }, [date]);

  const fetchMyParchis = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/parchis/my?date=${date}`);
      setParchis(res.data);
    } catch (err) {
      console.error('Failed to load employee parchis', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAssigned = parchis.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Assigned Parchis" subtitle="Daily recovery slips assigned to you by management" />

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

        <div className="text-right">
          <span className="label-xs block">Assigned Total</span>
          <span className="amount-table text-ink font-semibold">{formatRs(totalAssigned)}</span>
        </div>
      </Card>

      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : parchis.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No parchis assigned for this date"
            description="You have no assigned recovery slips recorded for the selected date."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Shopkeeper</th>
                  <th className="px-4 py-3 label-xs text-right">Parchi Amount</th>
                  <th className="px-4 py-3 label-xs">Account Type</th>
                  <th className="px-4 py-3 label-xs">Status</th>
                  <th className="px-4 py-3 label-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {parchis.map((p) => (
                  <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      <div>{p.shopkeeper?.shopName}</div>
                      <div className="text-xs text-ink-muted">{p.shopkeeper?.ownerName}</div>
                      {/* Show return reason inline */}
                      {p.status === 'RETURNED' && p.returnReason && (
                        <div className="text-xs text-danger/80 mt-0.5 flex items-center gap-1">
                          <Undo2 size={11} />
                          {p.returnReason}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 amount-table text-right">{formatRs(p.amount)}</td>
                    <td className="px-4 py-3 text-xs">
                      {p.shopkeeper?.hasKhata ? (
                        <span className="text-info font-medium">Khata Account</span>
                      ) : (
                        <span className="text-ink-muted">Daily Payment</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ParchiStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.collection ? (
                        // Already collected
                        <span className="text-xs text-success font-medium inline-flex items-center gap-1">
                          <CheckCircle size={14} /> Collected
                        </span>
                      ) : p.status === 'RETURNED' ? (
                        // Already returned (no action available to employee)
                        <span className="text-xs text-danger/70 font-medium inline-flex items-center gap-1">
                          <Undo2 size={13} /> Returned
                        </span>
                      ) : (
                        // PENDING — show Collect + Return buttons
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/employee/collections/new?parchiId=${p.id}`}>
                            <Button size="sm">
                              Collect <ArrowRight size={14} />
                            </Button>
                          </Link>
                          <button
                            onClick={() => setReturningParchi(p)}
                            title="Return parchi (no collection made)"
                            className="p-1.5 text-ink-light hover:text-danger transition-colors rounded hover:bg-danger-bg cursor-pointer"
                          >
                            <Undo2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Return Reason Dialog */}
      {returningParchi && (
        <ReturnReasonDialog
          parchi={returningParchi}
          onClose={() => setReturningParchi(null)}
          onSuccess={fetchMyParchis}
        />
      )}
    </div>
  );
}
