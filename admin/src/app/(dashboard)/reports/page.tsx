'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReports } from '@/hooks/useReports';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';

export default function ReportsPage() {
  const { user } = useAuth();
  const establishmentId = user?.establishmentId ?? '';
  const reports = useReports(establishmentId);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [summary, setSummary] = useState<{ total: number; count: number } | null>(null);
  const [top, setTop] = useState<{ name: string; quantity: number; total: number }[]>([]);
  const [methods, setMethods] = useState<Record<string, number>>({});

  const run = async () => {
    if (!start || !end) return;
    try {
      const [s, t, m] = await Promise.all([
        reports.fetchSalesSummary(start, end),
        reports.fetchTopProducts(start, end, 10),
        reports.fetchPaymentMethods(start, end),
      ]);
      setSummary(s);
      setTop(t);
      setMethods(m ?? {});
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <Input label="Início" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="Fim" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            <Button onClick={run} loading={reports.loading}>Gerar</Button>
          </div>
        </CardContent>
      </Card>
      {summary && (
        <Card>
          <CardContent className="pt-4">
            <p className="font-semibold">Total: {formatCurrency(summary.total)}</p>
            <p className="text-sm text-gray-500">Pedidos: {summary.count}</p>
          </CardContent>
        </Card>
      )}
      {Object.keys(methods).length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="font-semibold">Por pagamento</h2>
            {Object.entries(methods).map(([k, v]) => (
              <p key={k} className="text-sm">{k}: {formatCurrency(v)}</p>
            ))}
          </CardContent>
        </Card>
      )}
      {top.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h2 className="font-semibold">Top produtos</h2>
            {top.map((p) => (
              <p key={p.name} className="text-sm">{p.name}: {p.quantity} un - {formatCurrency(p.total)}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
