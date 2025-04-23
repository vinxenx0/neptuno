
import React from 'react';

const ConfigFileList = () => {
  return (
    <ul className="space-y-3 mb-6">
      <li className="flex items-center text-sm text-slate-600">
        <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
        .env - Environment variables
      </li>
      <li className="flex items-center text-sm text-slate-600">
        <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
        README.md - Project documentation
      </li>
      <li className="flex items-center text-sm text-slate-600">
        <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
        docker-compose.yml - Docker configuration
      </li>
      <li className="flex items-center text-sm text-slate-600">
        <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
        nginx.conf - Nginx configuration
      </li>
    </ul>
  );
};

export default ConfigFileList;
