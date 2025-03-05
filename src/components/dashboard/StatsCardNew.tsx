
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  iconColor?: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

const StatsCardNew: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  className,
  iconColor = 'text-primary',
  change
}) => {
  const cardClasses = cn(
    "bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all",
    className
  );
  
  const iconClasses = cn(
    "p-3 rounded-lg",
    iconColor.replace('text-', 'bg-').replace('primary', 'primary/10')
  );

  return (
    <div className={cardClasses}>
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
        
        <div className={iconClasses}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCardNew;
