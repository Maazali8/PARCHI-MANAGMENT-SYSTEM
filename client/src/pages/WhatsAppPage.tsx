import { useState, useEffect } from 'react';
import { MessageCircle, Copy, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { PageHeader, LoadingSkeleton } from '../components/ui/EmptyState';
import toast from 'react-hot-toast';
import type { User, WhatsAppMessage } from '../types';

export default function WhatsAppPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [msgType, setMsgType] = useState<'morning' | 'evening'>('morning');
  const [messageData, setMessageData] = useState<WhatsAppMessage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmpId) {
      fetchWhatsAppMessage();
    }
  }, [selectedEmpId, msgType]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users/employees');
      setEmployees(res.data);
      if (res.data.length > 0) setSelectedEmpId(res.data[0].id);
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  const fetchWhatsAppMessage = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/whatsapp/${msgType}/${selectedEmpId}`);
      setMessageData(res.data);
    } catch (err) {
      toast.error('Failed to generate WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (messageData?.message) {
      navigator.clipboard.writeText(messageData.message);
      toast.success('Message copied to clipboard!');
    }
  };

  const handleOpenWhatsApp = () => {
    if (messageData?.whatsappUrl) {
      window.open(messageData.whatsappUrl, '_blank');
    } else {
      toast.error('Employee phone number not registered');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <PageHeader title="WhatsApp Message Center" subtitle="Generate morning parchi assignments and evening collection summaries" />

      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Select Employee *"
            options={employees.map((e) => ({
              value: e.id,
              label: e.name,
              sublabel: e.phone ? `Phone: ${e.phone}` : 'No phone',
            }))}
            value={selectedEmpId}
            onChange={setSelectedEmpId}
          />

          <div className="flex flex-col gap-1.5">
            <label className="label">Message Workflow</label>
            <div className="flex gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => setMsgType('morning')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  msgType === 'morning' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
                }`}
              >
                Morning Assignment
              </button>
              <button
                type="button"
                onClick={() => setMsgType('evening')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  msgType === 'evening' ? 'bg-ink text-paper' : 'bg-cream text-ink-light hover:text-ink'
                }`}
              >
                Evening Summary
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Message Output Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-cream-deep pb-3">
          <h3 className="font-serif text-base flex items-center gap-2">
            <MessageCircle size={18} className="text-success" /> Generated WhatsApp Message
          </h3>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopy} disabled={!messageData}>
              <Copy size={14} /> Copy Text
            </Button>
            <Button size="sm" onClick={handleOpenWhatsApp} disabled={!messageData || !messageData.whatsappUrl}>
              <ExternalLink size={14} /> Send on WhatsApp
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm bg-cream p-4 rounded-md border border-cream-deep text-ink">
            {messageData?.message || 'Select an employee to generate message.'}
          </pre>
        )}
      </Card>
    </div>
  );
}
