import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Banknote, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { formatRs, getGreeting, formatTime } from '../lib/utils';
import { StatCard, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ParchiStatusBadge } from '../components/ui/Badge';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import { useAuthStore } from '../stores/authStore';
import type { EmployeeDashboard as EmployeeDashboardType } from '../types';

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<EmployeeDashboardType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/employee');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load employee dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={`${getGreeting()}, ${user?.name}`} subtitle="Your daily recovery dashboard" />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: '2-digit', month: 'short' });

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title={`${getGreeting()}, ${user?.name}`} subtitle={`Recovery Assignment — ${todayStr}`}>
        <Link to="/employee/collections/new">
          <Button size="sm">
            <Banknote size={16} /> Quick Collection
          </Button>
        </Link>
      </PageHeader>

      {/* Task Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Today's Assigned Amount"
          value={formatRs(data?.totalAssigned || 0)}
        />
        <StatCard
          label="Collected Amount"
          value={formatRs(data?.totalCollected || 0)}
        />
        <StatCard
          label="Remaining Collection"
          value={formatRs(data?.remaining || 0)}
        />
      </div>

      {/* Today's Assigned Parchis Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif">Today's Assigned Parchis ({data?.collectedCount || 0}/{data?.totalParchis || 0} Done)</h2>
          <Link to="/employee/parchis" className="text-xs text-ink-light hover:text-ink font-medium flex items-center gap-1">
            View All <ArrowRight size={12} />
          </Link>
        </div>

        <Card padding={false} className="overflow-hidden">
          {!data?.parchis || data.parchis.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No parchis assigned for today"
              description="Your daily assigned recovery slips will appear here once created by admin."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream border-b border-cream-deep">
                  <tr>
                    <th className="px-4 py-3 label-xs">Shopkeeper</th>
                    <th className="px-4 py-3 label-xs text-right">Parchi Amount</th>
                    <th className="px-4 py-3 label-xs">Khata Status</th>
                    <th className="px-4 py-3 label-xs">Status</th>
                    <th className="px-4 py-3 label-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-deep">
                  {data.parchis.map((p) => (
                    <tr key={p.id} className="hover:bg-cream/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">
                        <div>{p.shopkeeper?.shopName}</div>
                        <div className="text-xs text-ink-muted">{p.shopkeeper?.ownerName}</div>
                      </td>
                      <td className="px-4 py-3 amount-table text-right">{formatRs(p.amount)}</td>
                      <td className="px-4 py-3 text-xs">
                        {p.shopkeeper?.hasKhata ? (
                          <span className="text-info font-medium">Khata Customer</span>
                        ) : (
                          <span className="text-ink-muted">Daily Customer</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ParchiStatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.collection ? (
                          <span className="text-xs text-success font-medium inline-flex items-center gap-1">
                            <CheckCircle size={14} /> Collected
                          </span>
                        ) : (
                          <Link to={`/employee/collections/new?parchiId=${p.id}`}>
                            <Button size="sm" variant="primary">
                              Collect <ArrowRight size={14} />
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Today's Activity Timeline */}
      {data?.todayCollections && data.todayCollections.length > 0 && (
        <div>
          <h2 className="text-lg font-serif mb-4">Today's Collections Log</h2>
          <Card className="space-y-3">
            {data.todayCollections.map((col) => (
              <div key={col.id} className="flex items-center justify-between py-2 border-b border-cream-deep last:border-none">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success-bg text-success flex items-center justify-center">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{col.shopkeeper?.shopName}</p>
                    <p className="text-xs text-ink-muted">{formatTime(col.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="amount-table text-success">{formatRs(col.cashPayment + col.onlinePayment)}</p>
                  {col.addedToKhata > 0 && (
                    <p className="text-xs text-warning">Khata: {formatRs(col.addedToKhata)}</p>
                  )}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
