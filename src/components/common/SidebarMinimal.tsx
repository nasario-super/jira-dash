import React from 'react';
import Sidebar from './Sidebar';

const SidebarMinimal: React.FC = () => {
  console.log('🔍 SidebarMinimal rendering');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeSection="dashboard"
        onSectionChange={section => console.log('Section changed:', section)}
        isCollapsed={false}
        onToggleCollapse={() => console.log('Toggle clicked')}
      />

      {/* Main Content */}
      <div className="lg:ml-70">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Sidebar Minimal Test</h1>
          <p className="text-gray-600 mt-2">
            Esta é uma página de teste mínima para verificar se a Sidebar está
            sendo renderizada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SidebarMinimal;








