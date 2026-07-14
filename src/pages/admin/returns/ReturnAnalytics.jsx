import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700/50 min-w-[150px]">
        <p className="font-extrabold text-sm mb-3 border-b border-slate-700 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-sm font-medium mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-300">{entry.name}</span>
            </div>
            <span className="font-bold ml-4">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700/50 flex items-center gap-3">
        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: payload[0].payload.fill }}></span>
        <div>
          <p className="text-xs font-medium text-slate-300">{data.name}</p>
          <p className="font-extrabold text-lg leading-tight">{data.value}%</p>
        </div>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300 drop-shadow-md"
      />
    </g>
  );
};

export default function ReturnAnalytics({ trendData, reasonsData }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Return Trend Chart */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-200/60 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
        
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Returns & Refunds Trend</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Daily overview of your return requests</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"></span>
              <span className="text-xs font-bold text-slate-600">Returns</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30"></span>
              <span className="text-xs font-bold text-slate-600">Refunds</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRefunds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12} 
                fontWeight={600}
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => {
                  const d = new Date(val);
                  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                fontWeight={600}
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              
              <Area 
                type="monotone" 
                dataKey="returns" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorReturns)" 
                name="Returns"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6', className: 'drop-shadow-md' }}
              />
              <Area 
                type="monotone" 
                dataKey="refunds" 
                stroke="#10b981" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorRefunds)" 
                name="Refunds" 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', className: 'drop-shadow-md' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Return Reasons Chart */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/60 shadow-sm flex flex-col relative overflow-hidden group">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
        
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1 relative z-10">Return Reasons</h3>
        <p className="text-sm font-medium text-slate-500 mb-6 relative z-10">Analysis of customer feedback</p>
        
        <div className="flex-1 flex flex-col justify-center relative z-10">
          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reasonsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  cornerRadius={4}
                >
                  {reasonsData?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="transition-all duration-300 hover:drop-shadow-lg outline-none"
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-800">
                {reasonsData?.reduce((acc, curr) => acc + curr.value, 0) || 0}%
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-x-2 gap-y-3">
            {reasonsData?.map((entry, index) => (
              <motion.div 
                key={entry.name}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span className="w-3 h-3 rounded-md mr-2.5 shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-600 font-semibold truncate" title={entry.name}>{entry.name}</span>
                <span className="ml-auto font-black text-slate-800">{entry.value}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
