import React from 'react';

interface InfoItemProps {
  label: string;
  value?: string | number | null;
  children?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, children }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 mt-1">
        {children || value}
      </div>
    </div>
  );
};

export default InfoItem; 