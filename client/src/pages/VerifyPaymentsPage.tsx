import { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { formatRs, formatDate, formatTime } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Collection } from '../types';

export default function VerifyPaymentsPage() {
  const [pendingCollections, setPendingCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/collections/pending-verification/list');
      setPendingCollections(res.data);
    } catch (err) {
      console.error('Failed to load pending verifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (collectionId: string, type: 'parchi' | 'khata') => {
    try {
      setVerifyingId(collectionId);
      await api.patch(`/collections/${collectionId}/verify`, { type });
      toast.success('Online payment verified!');
      fetchPendingVerifications();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Online Payment Verification" subtitle="Confirm online transfers received via JazzCash, Easypaisa, or Bank" />

      <Card padding={false} className="overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : pendingCollections.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="All online payments verified!"
            description="There are currently no unverified online transfers pending approval."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream border-b border-cream-deep">
                <tr>
                  <th className="px-4 py-3 label-xs">Date & Time</th>
                  <th className="px-4 py-3 label-xs">Shopkeeper</th>
                  <th className="px-4 py-3 label-xs">Method</th>
                  <th className="px-4 py-3 label-xs text-right">Online Amount</th>
                  <th className="px-4 py-3 label-xs">Payment Type</th>
                  <th className="px-4 py-3 label-xs">Collector</th>
                  <th className="px-4 py-3 label-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-deep">
                {pendingCollections.map((col) => (
                  <tr key={col.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-ink">
                      <div>{formatDate(col.date)}</div>
                      <div className="text-ink-muted">{formatTime(col.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {col.shopkeeper?.shopName}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-info">
                      {col.onlineMethod || col.khataOnlineMethod || 'Online'}
                    </td>
                    <td className="px-4 py-3 amount-table text-right text-success font-semibold">
                      {formatRs(col.onlinePayment > 0 ? col.onlinePayment : col.khataPaymentOnline)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {col.onlinePayment > 0 && !col.onlineVerified ? (
                        <span className="text-warning font-medium">Parchi Payment</span>
                      ) : (
                        <span className="text-info font-medium">Old Khata Payment</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-light">{col.collectedBy?.name}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleVerify(col.id, col.onlinePayment > 0 ? 'parchi' : 'khata')}
                        loading={verifyingId === col.id}
                      >
                        <CheckCircle size={14} /> Verify & Confirm
                      </Button>
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
