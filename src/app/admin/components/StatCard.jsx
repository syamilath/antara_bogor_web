import React from 'react';

const StatCard = React.memo(function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center border border-blue-100 hover:shadow-2xl transition-all duration-200">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-blue-700 uppercase mb-1 tracking-wider">{title}</h3>
      <p className="text-4xl font-extrabold text-gray-900 drop-shadow">{value}</p>
    </div>
  );
});

export default StatCard; 