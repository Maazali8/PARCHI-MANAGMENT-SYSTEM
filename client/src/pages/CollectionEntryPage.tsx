import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Banknote, Calculator, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { formatRs } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PageHeader, LoadingSkeleton } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { Parchi } from '../types';

export default function CollectionEntryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialParchiId = searchParams.get('parchiId') || '';

  const [parchis, setParchis] = useState<Parchi[]>([]);
  const [selectedParchiId, setSelectedParchiId] = useState(initialParchiId);
  const [selectedParchi, setSelectedParchi] = useState<Parchi | null>(null);
  const [shopkeeperKhata, setShopkeeperKhata] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [discount, setDiscount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [goodsAdjustment, setGoodsAdjustment] = useState('');
  const [goodsDescription, setGoodsDescription] = useState('');
  const [cashPayment, setCashPayment] = useState('');
  const [onlinePayment, setOnlinePayment] = useState('');
  const [onlineMethod, setOnlineMethod] = useState('JazzCash');
  const [khataPayment, setKhataPayment] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchUncollectedParchis();
  }, []);

  useEffect(() => {
    if (selectedParchiId) {
      const p = parchis.find((item) => item.id === selectedParchiId);
      if (p) {
        setSelectedParchi(p);
        fetchKhataBalance(p.shopkeeperId);
      }
    } else {
      setSelectedParchi(null);
      setShopkeeperKhata(0);
    }
  }, [selectedParchiId, parchis]);

  const fetchUncollectedParchis = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parchis/today');
      // Filter out parchis that already have a collection or are marked as RETURNED
      const uncollected = res.data.filter((p: Parchi) => !p.collection && p.status !== 'RETURNED');
      setParchis(uncollected);

      if (initialParchiId) {
        const found = uncollected.find((p: Parchi) => p.id === initialParchiId);
        if (found) setSelectedParchiId(found.id);
      }
    } catch (err) {
      toast.error('Failed to load today parchis');
    } finally {
      setLoading(false);
    }
  };

  const fetchKhataBalance = async (shopkeeperId: string) => {
    try {
      const res = await api.get(`/shopkeepers/${shopkeeperId}`);
      setShopkeeperKhata(res.data.khataBalance || 0);
    } catch (err) {
      console.error('Failed to load khata balance', err);
    }
  };

  // Calculations
  const parchiAmt = selectedParchi?.amount || 0;
  const discountAmt = parseFloat(discount) || 0;
  const goodsAdj = parseFloat(goodsAdjustment) || 0;
  const netParchiAmount = Math.max(0, parchiAmt - discountAmt - goodsAdj);

  const cashPmt = parseFloat(cashPayment) || 0;
  const onlinePmt = parseFloat(onlinePayment) || 0;
  const totalParchiPayment = cashPmt + onlinePmt;

  const addedToKhata = Math.max(0, netParchiAmount - totalParchiPayment);
  const oldKhataPmt = parseFloat(khataPayment) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParchiId) {
      toast.error('Please select a parchi to collect');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/collections', {
        parchiId: selectedParchiId,
        discount: discountAmt,
        discountReason,
        goodsAdjustment: goodsAdj,
        goodsDescription,
        cashPayment: cashPmt,
        onlinePayment: onlinePmt,
        onlineMethod: onlinePmt > 0 ? onlineMethod : undefined,
        khataPayment: oldKhataPmt,
        notes,
      });

      toast.success('Collection submitted successfully');
      navigate(-1);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit collection');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Collection Entry" subtitle="Record daily recovery payment" />
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-cream rounded-md transition-colors text-ink-light hover:text-ink cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <PageHeader title="Collection Entry" subtitle="Record payment, discount, goods adjustment, and khata" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Parchi */}
        <Card className="space-y-4">
          <h3 className="text-base font-medium">1. Select Shopkeeper & Parchi</h3>
          <Select
            label="Today's Pending Parchi *"
            options={parchis.map((p) => ({
              value: p.id,
              label: `${p.shopkeeper.shopName} — Rs. ${p.amount.toLocaleString()}`,
              sublabel: `${p.shopkeeper.ownerName} • Assigned: ${p.employee.name}`,
            }))}
            value={selectedParchiId}
            onChange={setSelectedParchiId}
            placeholder="Select a parchi to collect..."
          />

          {selectedParchi && (
            <div className="bg-cream p-4 rounded-md flex flex-col sm:flex-row justify-between gap-4 text-sm">
              <div>
                <p className="label-xs">Customer Type</p>
                <p className="font-medium">
                  {selectedParchi.shopkeeper.hasKhata ? (
                    <span className="text-info font-medium">Khata Customer</span>
                  ) : (
                    <span className="text-ink-muted">Daily Payment Customer</span>
                  )}
                </p>
              </div>

              {selectedParchi.shopkeeper.hasKhata && (
                <div>
                  <p className="label-xs">Previous Khata Balance</p>
                  <p className="amount-table text-danger font-semibold">{formatRs(shopkeeperKhata)}</p>
                </div>
              )}

              <div>
                <p className="label-xs">Original Parchi Amount</p>
                <p className="amount-table text-ink font-semibold">{formatRs(selectedParchi.amount)}</p>
              </div>
            </div>
          )}
        </Card>

        {selectedParchi && (
          <>
            {/* Step 2: Adjustments */}
            <Card className="space-y-4">
              <h3 className="text-base font-medium">2. Discount & Goods Adjustment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Discount Amount"
                  type="number"
                  isAmount
                  prefix="Rs."
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Discount Reason"
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="Optional reason..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Goods Adjustment Amount"
                  type="number"
                  isAmount
                  prefix="Rs."
                  value={goodsAdjustment}
                  onChange={(e) => setGoodsAdjustment(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Adjustment Description"
                  type="text"
                  value={goodsDescription}
                  onChange={(e) => setGoodsDescription(e.target.value)}
                  placeholder="Items/goods description..."
                />
              </div>
            </Card>

            {/* Step 3: Payments for Today's Parchi */}
            <Card className="space-y-4">
              <h3 className="text-base font-medium">3. Today's Parchi Payment Received</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cash Payment"
                  type="number"
                  isAmount
                  prefix="Rs."
                  value={cashPayment}
                  onChange={(e) => setCashPayment(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Online Payment"
                  type="number"
                  isAmount
                  prefix="Rs."
                  value={onlinePayment}
                  onChange={(e) => setOnlinePayment(e.target.value)}
                  placeholder="0"
                />
              </div>

              {onlinePmt > 0 && (
                <div className="max-w-xs">
                  <Select
                    label="Online Payment Method"
                    options={[
                      { value: 'JazzCash', label: 'JazzCash' },
                      { value: 'Easypaisa', label: 'Easypaisa' },
                      { value: 'Bank Transfer', label: 'Bank Transfer' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    value={onlineMethod}
                    onChange={setOnlineMethod}
                    searchable={false}
                  />
                  <p className="text-xs text-warning mt-1">* Will require admin verification</p>
                </div>
              )}
            </Card>

            {/* Step 4: Old Khata Payment (If Khata Customer) */}
            {selectedParchi.shopkeeper.hasKhata && (
              <Card className="space-y-4 bg-cream-warm/50 border-info/20">
                <h3 className="text-base font-medium text-ink flex items-center gap-2">
                  <Banknote size={18} className="text-info" />
                  4. Payment Against Old Khata
                </h3>
                <p className="text-xs text-ink-light">
                  If customer is paying money specifically towards their old running balance ({formatRs(shopkeeperKhata)})
                </p>
                <div className="max-w-xs">
                  <Input
                    label="Khata Payment Amount"
                    type="number"
                    isAmount
                    prefix="Rs."
                    value={khataPayment}
                    onChange={(e) => setKhataPayment(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </Card>
            )}

            {/* Notes */}
            <Card className="space-y-2">
              <label className="label">Notes / Remarks</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special remarks..."
                rows={2}
                className="w-full bg-paper border border-cream-deep rounded-md p-3 text-sm focus:outline-none focus:border-ink"
              />
            </Card>

            {/* Step 5: Automatic Calculation Summary Box */}
            <Card className="bg-ink text-paper p-6 space-y-4">
              <h3 className="font-serif text-lg text-paper flex items-center gap-2 border-b border-paper/10 pb-3">
                <Calculator size={20} /> Settlement Summary
              </h3>

              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-paper/70">Original Parchi:</span>
                <span className="amount-table text-right">{formatRs(parchiAmt)}</span>

                {(discountAmt > 0 || goodsAdj > 0) && (
                  <>
                    <span className="text-paper/70">Discounts & Adjustments:</span>
                    <span className="amount-table text-right text-warning">- {formatRs(discountAmt + goodsAdj)}</span>
                  </>
                )}

                <span className="font-semibold text-paper pt-1 border-t border-paper/10">Net Payable Amount:</span>
                <span className="amount-table text-right font-semibold text-paper pt-1 border-t border-paper/10">
                  {formatRs(netParchiAmount)}
                </span>

                <span className="text-paper/70">Total Payment Received:</span>
                <span className="amount-table text-right text-success">{formatRs(totalParchiPayment)}</span>

                {addedToKhata > 0 && (
                  <>
                    <span className="text-warning font-medium">Added to Khata:</span>
                    <span className="amount-table text-right text-warning font-medium">{formatRs(addedToKhata)}</span>
                  </>
                )}

                {oldKhataPmt > 0 && (
                  <>
                    <span className="text-info font-medium">Paid Against Old Khata:</span>
                    <span className="amount-table text-right text-info font-medium">{formatRs(oldKhataPmt)}</span>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-paper/10">
                <Button type="button" variant="secondary" className="border-paper/20 text-paper hover:bg-paper/10" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" loading={submitting} className="border bg-ink text-paper hover:bg-success hover:text-paper">
                  <CheckCircle size={16} /> Confirm & Submit Collection
                </Button>
              </div>
            </Card>
          </>
        )}
      </form>
    </div>
  );
}
