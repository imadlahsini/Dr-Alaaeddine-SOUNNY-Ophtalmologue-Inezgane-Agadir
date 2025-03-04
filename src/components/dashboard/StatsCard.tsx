
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  change
}) => {
  return (
    <motion.div
      whileHover={{ translateY: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
      className="bg-white p-5 rounded-xl shadow-md transition-all"
    >
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${
                change.trend === 'up' ? 'text-green-600' : 
                change.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change.trend === 'up' && '+'}
                {change.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">from last week</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${iconColor.replace('text-', 'bg-').replace('primary', 'primary/10')}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
