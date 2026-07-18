import React from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, Maximize2 } from 'lucide-react';

export default function ChartWidget({ title, data, type = 'line', dataKey = 'revenue', xAxisKey = 'date', color = '#6366f1' }) {
  
  const renderChart = () => {
    switch(type) {
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#color-${dataKey})`} />
          </AreaChart>
        );
      default:
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }} activeDot={{ r: 6 }} />
          </LineChart>
        );
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm w-full h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <div className="flex gap-1">
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
