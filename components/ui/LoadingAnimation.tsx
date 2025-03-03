import React from 'react';

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  size = 'md',
  color = 'indigo',
  text
}) => {
  // Size mappings
  const sizeMap = {
    sm: {
      container: 'h-16 w-16',
      circle: 'h-16 w-16',
      innerCircle: 'h-8 w-8'
    },
    md: {
      container: 'h-24 w-24',
      circle: 'h-24 w-24',
      innerCircle: 'h-12 w-12'
    },
    lg: {
      container: 'h-32 w-32',
      circle: 'h-32 w-32',
      innerCircle: 'h-16 w-16'
    }
  };

  // Color mappings
  const colorMap = {
    indigo: {
      outer: 'border-indigo-600',
      inner: 'bg-gradient-to-r from-indigo-500 to-purple-500'
    },
    blue: {
      outer: 'border-blue-500',
      inner: 'bg-gradient-to-r from-blue-400 to-blue-600'
    },
    green: {
      outer: 'border-green-500',
      inner: 'bg-gradient-to-r from-green-400 to-green-600'
    },
    amber: {
      outer: 'border-amber-500',
      inner: 'bg-gradient-to-r from-amber-400 to-amber-600'
    }
  };

  const selectedSize = sizeMap[size];
  const selectedColor = colorMap[color as keyof typeof colorMap] || colorMap.indigo;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${selectedSize.container}`}>
        {/* Outer spinning circle */}
        <div className={`absolute inset-0 rounded-full border-4 border-t-transparent ${selectedColor.outer} animate-spin shadow-md`}></div>
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${selectedSize.innerCircle} ${selectedColor.inner} rounded-full animate-pulse shadow-inner`}></div>
        </div>
      </div>
      
      {text && (
        <div className="mt-4 text-center">
          <p className="text-gray-700 font-medium">{text}</p>
        </div>
      )}
    </div>
  );
};

export default LoadingAnimation; 