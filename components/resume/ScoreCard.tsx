import React from 'react';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp, Quote } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  section: string;
  feedback: string[];
  improvements: string[];
  quotes?: string[];
  className?: string;
}

const ScoreCard = ({ score, section, feedback, improvements, quotes = [], className = '' }: ScoreCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [hasBeenClicked, setHasBeenClicked] = React.useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
    }
  };

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  // Determine background color based on score
  const getScoreBgColor = () => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-amber-50';
    return 'bg-red-50';
  };

  // Determine border color based on score
  const getBorderColor = () => {
    if (score >= 80) return 'border-green-200';
    if (score >= 60) return 'border-amber-200';
    return 'border-red-200';
  };

  // Determine progress bar color based on score
  const getProgressColor = () => {
    if (score >= 80) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (score >= 60) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  return (
    <div className={`border rounded-lg overflow-hidden mb-4 shadow-sm hover:shadow-md transition-all ${getBorderColor()} ${className} relative`}>
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-4 flex-grow">
          {score >= 70 ? (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          )}
          <h3 className="text-base font-medium text-gray-900 truncate">{section}</h3>
          
          {!hasBeenClicked && (
            <div className="flex items-center ml-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full animate-pulse">
              <span>Click to expand</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="flex flex-col items-end">
            <div className={`font-bold text-base ${getScoreColor()}`}>
              {score}%
            </div>
            <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
              <div 
                className={`h-1.5 rounded-full ${getProgressColor()}`} 
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
          <div className={`rounded-full p-1 transition-all duration-200 ${isExpanded ? 'bg-gray-200' : 'bg-indigo-100'}`}>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-indigo-600" />
            )}
          </div>
        </div>
      </div>
      
      {!isExpanded && !hasBeenClicked && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Click to see detailed feedback
        </div>
      )}
      
      {isExpanded && (
        <div className={`p-4 border-t ${getScoreBgColor()} ${getBorderColor()}`}>
          {feedback.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-gray-800">What's Working Well</h4>
              <ul className="space-y-2">
                {feedback.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start bg-white p-2 rounded-lg shadow-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="flex-grow">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {improvements.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-gray-800">Suggested Improvements</h4>
              <ul className="space-y-2">
                {improvements.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start bg-white p-2 rounded-lg shadow-sm">
                    <AlertCircle className="h-4 w-4 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="flex-grow">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {quotes && quotes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-gray-800">Specific References</h4>
              <ul className="space-y-2">
                {quotes.map((quote, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start bg-white p-2 rounded-lg shadow-sm border-l-4 border-indigo-400">
                    <Quote className="h-4 w-4 text-indigo-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-grow">
                      <p className="italic text-gray-600">"{quote}"</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreCard; 