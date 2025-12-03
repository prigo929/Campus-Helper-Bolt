'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, CheckCircle, Trash2, Ban } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

type Report = {
  id: string;
  target_type: string;
  target_table: string;
  target_id: string | null;
  target_user_id: string | null;
  reporter_user_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
};

type ReportCardProps = {
  report: Report;
  showActions?: boolean;
  onMarkReviewed?: (id: string) => void | Promise<void>;
  onDeleteContent?: (report: Report) => void | Promise<void>;
  onBanUser?: (userId: string | null) => void | Promise<void>;
};

type ReportSectionProps = {
  title: string;
  description: string;
  emptyText: string;
  icon: LucideIcon;
  reports: Report[];
  showActions?: boolean;
  onMarkReviewed?: (id: string) => void | Promise<void>;
  onDeleteContent?: (report: Report) => void | Promise<void>;
  onBanUser?: (userId: string | null) => void | Promise<void>;
};

const REPORT_FIELDS =
  'id, target_type, target_table, target_id, target_user_id, reporter_user_id, reason, details, status, created_at';

const formatDate = (value: string) => new Date(value).toLocaleString();

const ReportCard = ({
  report,
  showActions = false,
  onMarkReviewed,
  onDeleteContent,
  onBanUser,
}: ReportCardProps) => (
  <div className="space-y-2 rounded-md border bg-white p-3">
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        <span className="font-semibold text-[#1e3a5f]">{report.target_type}</span>{' '}
        on <span className="text-gray-800">{report.target_table}</span>
      </div>
      <Badge>{report.status}</Badge>
    </div>
    <div className="text-sm text-gray-600">
      Reason: <span className="font-semibold text-gray-800">{report.reason}</span>
      {report.details && <div className="mt-1">Details: {report.details}</div>}
    </div>
    <div className="text-xs text-gray-500">Reported at {formatDate(report.created_at)}</div>
    {showActions && (
      <div className="flex flex-wrap gap-2">
        {onMarkReviewed && (
          <Button variant="outline" size="sm" onClick={() => onMarkReviewed(report.id)}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Mark reviewed
          </Button>
        )}
        {onDeleteContent && (
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onDeleteContent(report)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete content
          </Button>
        )}
        {onBanUser && (
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onBanUser(report.target_user_id)}
          >
            <Ban className="mr-1 h-4 w-4" />
            Ban user
          </Button>
        )}
      </div>
    )}
  </div>
);

const ReportSection = ({
  title,
  description,
  emptyText,
  icon: Icon,
  reports,
  showActions = false,
  onMarkReviewed,
  onDeleteContent,
  onBanUser,
}: ReportSectionProps) => (
  <Card className="border-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg text-[#1e3a5f]">
        <Icon className="h-4 w-4" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {reports.length === 0 && <p className="text-sm text-gray-600">{emptyText}</p>}
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          showActions={showActions}
          onMarkReviewed={onMarkReviewed}
          onDeleteContent={onDeleteContent}
          onBanUser={onBanUser}
        />
      ))}
    </CardContent>
  </Card>
);

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const isAdmin = sessionData.session?.user?.user_metadata?.role === 'admin';
      if (!isAdmin) {
        setError('You must be an admin to view this page.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('reports')
        .select(REPORT_FIELDS)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setReports(data || []);
      }

      setLoading(false);
    };

    load();
  }, []);

  const handleMarkReviewed = async (id: string) => {
    if (!supabase) return;
    const { error: updateError } = await supabase.from('reports').update({ status: 'reviewed' }).eq('id', id);
    if (updateError) {
      setActionMessage(updateError.message);
      return;
    }
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'reviewed' } : r)));
    setActionMessage('Marked as reviewed.');
  };

  const handleDeleteContent = async (report: Report) => {
    if (!supabase || !report.target_table || !report.target_id) return;
    const { error: deleteError } = await supabase.from(report.target_table).delete().eq('id', report.target_id);
    if (deleteError) {
      setActionMessage(deleteError.message);
      return;
    }
    setActionMessage('Content deleted.');
  };

  const handleBanUser = async (userId: string | null) => {
    if (!supabase || !userId) return;
    const { error: banError } = await supabase.from('profiles').update({ role: 'banned' }).eq('id', userId);
    if (banError) {
      setActionMessage(banError.message);
      return;
    }
    setActionMessage('User banned.');
  };

  const openReports = useMemo(() => reports.filter((r) => r.status === 'open'), [reports]);
  const reviewedReports = useMemo(() => reports.filter((r) => r.status !== 'open'), [reports]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1e3a5f]">Admin Reports</h1>
              <p className="text-sm text-gray-600">Review and act on user reports.</p>
            </div>
            <Button variant="ghost" onClick={() => router.refresh()}>
              Refresh
            </Button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading reports...
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800 mb-4">
              {actionMessage}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-6">
              <ReportSection
                title="Open Reports"
                description={`${openReports.length} open`}
                emptyText="No open reports."
                icon={ShieldAlert}
                reports={openReports}
                showActions
                onMarkReviewed={handleMarkReviewed}
                onDeleteContent={handleDeleteContent}
                onBanUser={handleBanUser}
              />

              <ReportSection
                title="Reviewed Reports"
                description={`${reviewedReports.length} reviewed`}
                emptyText="No reviewed reports."
                icon={CheckCircle}
                reports={reviewedReports}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
