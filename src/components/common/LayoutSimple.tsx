import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutSimpleProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date;
}

const LayoutSimple: React.FC<LayoutSimpleProps> = ({
  children,
  activeSection = 'dashboard',
  onSectionChange,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  console.log('🔍 LayoutSimple rendering:', {
    activeSection,
    isSidebarCollapsed,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info */}
      <div className="fixed top-0 right-0 bg-red-500 text-white p-2 text-xs z-50">
        Sidebar: {isSidebarCollapsed ? 'Collapsed' : 'Expanded'}
      </div>

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-70'
        }`}
      >
        {/* Header */}
        <Header
          onRefresh={onRefresh || (() => {})}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default LayoutSimple;








