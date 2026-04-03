'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartComponentProps {
  data: Array<{
    date?: string;
    test?: string;
    value: number;
    unit?: string;
    [key: string]: any;
  }>;
  type: 'line' | 'bar';
  title: string;
  description?: string;
  xKey: string;
  yKey: string;
  highlightAbnormal?: boolean;
}

export function ChartComponent({
  data,
  type,
  title,
  description,
  xKey,
  yKey,
  highlightAbnormal = false,
}: ChartComponentProps) {
  const processedData = data.map((item) => ({
    ...item,
    fill:
      highlightAbnormal && item.abnormal ? '#ef4444' : item.fill || (type === 'line' ? '#2563eb' : '#3b82f6'),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'line' ? (
            <LineChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={processedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar dataKey={yKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
