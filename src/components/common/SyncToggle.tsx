import React from 'react';

interface SyncToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const SyncToggle: React.FC<SyncToggleProps> = ({ id, label, description, checked, onChange, disabled = false }) => {
  return (
    <div className={`flex justify-between items-center p-3 rounded-lg ${disabled ? 'bg-gray-100 dark:bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-700'}`}>
      <div>
        <h4 className={`font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{label}</h4>
        <p className={`text-sm ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
        />
        <label
          htmlFor={id}
          className={`block w-12 h-7 rounded-full transition-colors duration-300 ease-in-out ${
            checked ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          <span
            className={`block w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform duration-300 ease-in-out transform ${
              checked ? 'translate-x-5' : ''
            }`}
          />
        </label>
      </div>
    </div>
  );
};

export default SyncToggle; 