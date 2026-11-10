import { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data generator for 30 days
const generateData = () => {
  const data = [];
  let baseValue = 12000;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // add some randomness
    baseValue += Math.floor(Math.random() * 500) - 150;
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString(),
      subscribers: baseValue,
      views: baseValue * (Math.random() * 5 + 5),
    });
  }
  return data;
};

export default function HoverLineChart() {
  const data = useMemo(() => generateData(), []);
  
  const [activeData, setActiveData] = useState<any>(data[data.length - 1]);
  const [isHovering, setIsHovering] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState<number | null>(null);

  const handleMouseMove = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setActiveData(state.activePayload[0].payload);
      setActiveDateIndex(state.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setActiveData(data[data.length - 1]);
    setActiveDateIndex(null);
  };

  return (
    <div className="flex flex-col h-full" onMouseLeave={handleMouseLeave} onMouseEnter={() => setIsHovering(true)}>
      {/* Header that updates on hover scrub */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Audience Growth</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {isHovering ? activeData.date : 'Last 30 Days'}
          </p>
        </div>
        
        <div className="text-right">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeData.subscribers}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5"
            >
              {activeData.subscribers.toLocaleString()}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-1 text-xs text-emerald-400 justify-end">
            <TrendingUp className="w-3 h-3" />
            <span>Active Subs</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} onMouseMove={handleMouseMove}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#909296', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']}
              hide
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xl border border-slate-200 dark:border-white/10 rounded-lg p-3">
                      <p className="text-sm text-slate-900 dark:text-white font-semibold mb-1">{label}</p>
                      <p className="text-sm text-[#8b5cf6] font-bold">
                        {Number(payload[0].value).toLocaleString()} subscribers
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={false}
            />
            
            {/* The Laser Vertical Line */}
            {isHovering && activeDateIndex !== null && (
              <ReferenceLine 
                x={data[activeDateIndex].date} 
                stroke="#845ef7" 
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ position: 'top', value: '●', fill: '#845ef7', fontSize: 18 }}
              />
            )}
            
            <Area 
              type="monotone" 
              dataKey="subscribers" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorValue)"
              animationDuration={1500}
              activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#1A1B1E', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
