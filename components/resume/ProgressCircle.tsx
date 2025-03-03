import React from 'react';

interface ProgressCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressCircle = ({ score, size = 160, strokeWidth = 12 }: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;
  
  // Determine gradient IDs based on score
  const getGradientId = () => {
    if (score >= 80) return 'greenGradient';
    if (score >= 60) return 'amberGradient';
    return 'redGradient';
  };
  
  // Determine text for score description
  const getScoreText = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  // Determine text color based on score
  const getTextColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  // Determine background color for inner circle
  const getInnerBgColor = () => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <defs>
            {/* Green gradient */}
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            
            {/* Amber gradient */}
            <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            
            {/* Red gradient */}
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${getGradientId()})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Score text */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full ${getInnerBgColor()}`} style={{ margin: strokeWidth / 2 }}>
          <span className={`text-4xl font-bold ${getTextColor()}`}>
            {score}%
          </span>
          <span className="text-sm text-gray-700 mt-1 font-medium">{getScoreText()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle; 