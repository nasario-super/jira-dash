import React, { useState } from 'react';
import Sidebar from './Sidebar';

const SidebarDebug: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  console.log('🔍 SidebarDebug rendering:', {
    activeSection,
    isCollapsed,
  });

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Debug info */}
      <div className="fixed top-0 right-0 bg-red-500 text-white p-2 text-xs z-50">
        Debug: Sidebar {isCollapsed ? 'Collapsed' : 'Expanded'}
      </div>

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-70'
        }`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Sidebar Debug</h1>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded">
              <h2 className="font-semibold">Seção Ativa: {activeSection}</h2>
              <p>Sidebar: {isCollapsed ? 'Colapsada' : 'Expandida'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`p-2 rounded ${
                  activeSection === 'dashboard'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection('agile')}
                className={`p-2 rounded ${
                  activeSection === 'agile'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Agile
              </button>
              <button
                onClick={() => setActiveSection('analytics')}
                className={`p-2 rounded ${
                  activeSection === 'analytics'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveSection('ai-analytics')}
                className={`p-2 rounded ${
                  activeSection === 'ai-analytics'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                AI Analytics
              </button>
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Toggle Sidebar: {isCollapsed ? 'Expandir' : 'Colapsar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarDebug;







