import React from 'react';
import { BarChart3, Activity, Brain, Settings, Users, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navigation = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'analyst', 'viewer'] },
    { key: 'analytics', label: 'Analytics', icon: Activity, roles: ['admin', 'analyst'] },
    { key: 'models', label: 'Models', icon: Brain, roles: ['admin', 'analyst'] },
    { key: 'traffic', label: 'Traffic Generator', icon: Settings, roles: ['admin', 'analyst'] },
    { key: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    { key: 'security', label: 'Security', icon: Shield, roles: ['admin'] }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'viewer')
  );

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {filteredItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
