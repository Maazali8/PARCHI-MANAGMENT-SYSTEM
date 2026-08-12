import { useState, useEffect } from 'react';
import { Printer, Download, BarChart3 } from 'lucide-react';
import api from '../lib/api';
import { formatRs, todayStr, currentMonthStr } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'daily' | 'monthly' | 'khata';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [date, setDate] = useState(todayStr());
  const [month, setMonth] = useState(currentMonthStr());
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [reportType, date, month]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = `/reports/daily?date=${date}`;
      if (reportType === 'monthly') endpoint = `/reports/monthly?month=${month}`;
      if (reportType === 'khata') endpoint = '/reports/khata';

      const res = await api.get(endpoint);
      setReportData(res.data);
    } catch (err) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Parchi Management System — Report', 14, 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Report Type: ${reportType.toUpperCase()} | Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    if (reportType === 'daily' && reportData.collections) {
      autoTable(doc, {
        startY: 28,
        head: [['Shopkeeper', 'Parchi', 'Discount/Adj', 'Cash', 'Online', 'Khata Added', 'Collector']],
        body: reportData.collections.map((c: any) => [
          c.shopkeeper?.shopName || '-',
          `Rs. ${c.parchiAmount.toLocaleString()}`,
          `Rs. ${(c.discount + c.goodsAdjustment).toLocaleString()}`,
          `Rs. ${c.cashPayment.toLocaleString()}`,
          `Rs. ${c.onlinePayment.toLocaleString()}`,
          `Rs. ${c.addedToKhata.toLocaleString()}`,
          c.collectedBy?.name || '-',
        ]),
      });
    } else if (reportType === 'monthly' && reportData.dailySummaries) {
      autoTable(doc, {
        startY: 28,
        head: [['Date', 'Cash Recovered', 'Online Recovered', 'Khata Added', 'Khata Paid', 'Entries']],
        body: reportData.dailySummaries.map((s: any) => [
          s.date,
          `Rs. ${s.totalCash.toLocaleString()}`,
          `Rs. ${s.totalOnline.toLocaleString()}`,
          `Rs. ${s.totalKhataAdded.toLocaleString()}`,
          `Rs. ${s.totalKhataPayment.toLocaleString()}`,
          s.count,
        ]),
      });
    } else if (reportType === 'khata' && reportData.shopkeepers) {
      autoTable(doc, {
        startY: 28,
        head: [['Shopkeeper', 'Owner Name', 'Running Khata Balance']],
        body: reportData.shopkeepers.map((k: any) => [
          k.shopkeeper.shopName,
          k.shopkeeper.ownerName,
          `Rs. ${k.balance.toLocaleString()}`,
        ]),
      });
    }

    doc.save(`report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF Exported successfully');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between no-print">
        <PageHeader title="Business Reports" subtitle="Generate, print, and export daily and monthly recovery reports" />
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Report
          </Button>
          <Button onClick={handleExportPDF}>
            <Download size={16} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Report Selector & Date Filter */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 no-print">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              reportType === 'daily' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
            }`}
          >
            Daily Report
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              reportType === 'monthly' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
            }`}
          >
            Monthly Summary
          </button>
          <button
            onClick={() => setReportType('khata')}
            className={`px-4 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              reportType === 'khata' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
            }`}
          >
            Khata Report
          </button>
        </div>

        <div>
          {reportType === 'daily' && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-paper border border-cream-deep rounded-md px-3 py-1.5 text-sm font-medium text-ink focus:outline-none"
            />
          )}
          {reportType === 'monthly' && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-paper border border-cream-deep rounded-md px-3 py-1.5 text-sm font-medium text-ink focus:outline-none"
            />
          )}
        </div>
      </Card>

      {/* Printable Report View */}
      <div className="printable-content space-y-6">
        {loading ? (
          <LoadingSkeleton rows={8} />
        ) : !reportData ? (
          <EmptyState icon={BarChart3} title="No report data available" />
        ) : (
          <>
            {/* DAILY REPORT VIEW */}
            {reportType === 'daily' && (
              <div className="space-y-6">
                {/* Summary Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <p className="label-xs">Total Cash Recovered</p>
                    <p className="amount-hero text-success">{formatRs(reportData.summary?.totalCash)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="label-xs">Total Online Recovered</p>
                    <p className="amount-hero text-success">{formatRs(reportData.summary?.totalOnline)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="label-xs">Total Added to Khata</p>
                    <p className="amount-hero text-warning">{formatRs(reportData.summary?.totalKhataAdded)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="label-xs">Old Khata Paid</p>
                    <p className="amount-hero text-info">{formatRs(reportData.summary?.totalKhataPayment)}</p>
                  </Card>
                </div>

                <Card padding={false} className="overflow-hidden">
                  <div className="px-4 py-3 bg-cream border-b border-cream-deep font-serif font-medium text-base">
                    Daily Recovery Breakdown — {date}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-cream border-b border-cream-deep">
                        <tr>
                          <th className="px-4 py-3 label-xs">Shopkeeper</th>
                          <th className="px-4 py-3 label-xs text-right">Parchi</th>
                          <th className="px-4 py-3 label-xs text-right">Discount/Adj</th>
                          <th className="px-4 py-3 label-xs text-right">Cash</th>
                          <th className="px-4 py-3 label-xs text-right">Online</th>
                          <th className="px-4 py-3 label-xs text-right">Khata Added</th>
                          <th className="px-4 py-3 label-xs text-right">Khata Paid</th>
                          <th className="px-4 py-3 label-xs">Employee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-deep">
                        {reportData.collections?.map((c: any) => (
                          <tr key={c.id}>
                            <td className="px-4 py-3 font-medium text-ink">{c.shopkeeper?.shopName}</td>
                            <td className="px-4 py-3 amount-table text-right">{formatRs(c.parchiAmount)}</td>
                            <td className="px-4 py-3 amount-table text-right text-warning">
                              {c.discount + c.goodsAdjustment > 0 ? `- ${formatRs(c.discount + c.goodsAdjustment)}` : '-'}
                            </td>
                            <td className="px-4 py-3 amount-table text-right text-success">{formatRs(c.cashPayment)}</td>
                            <td className="px-4 py-3 amount-table text-right text-success">{formatRs(c.onlinePayment)}</td>
                            <td className="px-4 py-3 amount-table text-right text-warning">{formatRs(c.addedToKhata)}</td>
                            <td className="px-4 py-3 amount-table text-right text-info">{formatRs(c.khataPayment)}</td>
                            <td className="px-4 py-3 text-xs text-ink-light">{c.collectedBy?.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* MONTHLY REPORT VIEW */}
            {reportType === 'monthly' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <p className="label-xs">Total Cash Recovered</p>
                    <p className="amount-hero text-success">{formatRs(reportData.summary?.totalCash)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="label-xs">Total Online Recovered</p>
                    <p className="amount-hero text-success">{formatRs(reportData.summary?.totalOnline)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="label-xs">Grand Total Recovered</p>
                    <p className="amount-hero text-ink">{formatRs(reportData.summary?.totalCollection)}</p>
                  </Card>
                </div>

                <Card padding={false} className="overflow-hidden">
                  <div className="px-4 py-3 bg-cream border-b border-cream-deep font-serif font-medium text-base">
                    Monthly Breakdown — {month}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-cream border-b border-cream-deep">
                        <tr>
                          <th className="px-4 py-3 label-xs">Date</th>
                          <th className="px-4 py-3 label-xs text-right">Cash Recovered</th>
                          <th className="px-4 py-3 label-xs text-right">Online Recovered</th>
                          <th className="px-4 py-3 label-xs text-right">Khata Added</th>
                          <th className="px-4 py-3 label-xs text-right">Khata Paid</th>
                          <th className="px-4 py-3 label-xs text-right">Collections</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-deep">
                        {reportData.dailySummaries?.map((s: any) => (
                          <tr key={s.date}>
                            <td className="px-4 py-3 font-medium text-ink">{s.date}</td>
                            <td className="px-4 py-3 amount-table text-right text-success">{formatRs(s.totalCash)}</td>
                            <td className="px-4 py-3 amount-table text-right text-success">{formatRs(s.totalOnline)}</td>
                            <td className="px-4 py-3 amount-table text-right text-warning">{formatRs(s.totalKhataAdded)}</td>
                            <td className="px-4 py-3 amount-table text-right text-info">{formatRs(s.totalKhataPayment)}</td>
                            <td className="px-4 py-3 text-xs text-right text-ink font-semibold">{s.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* KHATA REPORT VIEW */}
            {reportType === 'khata' && (
              <div className="space-y-6">
                <Card className="p-4 flex items-center justify-between">
                  <div>
                    <p className="label-xs">Total Outstanding Khata</p>
                    <p className="amount-hero text-danger">{formatRs(reportData.totalKhata)}</p>
                  </div>
                  <p className="text-xs text-ink-muted">{reportData.shopkeepers?.length || 0} Credit Accounts Active</p>
                </Card>

                <Card padding={false} className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-cream border-b border-cream-deep">
                        <tr>
                          <th className="px-4 py-3 label-xs">Shopkeeper</th>
                          <th className="px-4 py-3 label-xs">Owner Name</th>
                          <th className="px-4 py-3 label-xs text-right">Outstanding Khata Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-deep">
                        {reportData.shopkeepers?.map((k: any) => (
                          <tr key={k.shopkeeper.id}>
                            <td className="px-4 py-3 font-medium text-ink">{k.shopkeeper.shopName}</td>
                            <td className="px-4 py-3 text-xs text-ink-light">{k.shopkeeper.ownerName}</td>
                            <td className="px-4 py-3 amount-table text-right text-danger font-semibold">
                              {formatRs(k.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
