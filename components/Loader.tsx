
import React from 'react';

const Loader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-brand-text-secondary">
      <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
};

export default Loader;
