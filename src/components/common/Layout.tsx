import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: Date;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  activeSection: propActiveSection,
  onSectionChange,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Detectar seção ativa baseada na URL
  const getActiveSectionFromPath = (pathname: string): string => {
    const pathMap: Record<string, string> = {
      '/': 'dashboard',
      '/agile': 'agile',
      '/executive': 'executive',
      '/reports': 'reports',
      '/slack': 'slack',
      '/quality': 'quality',
      '/analytics': 'analytics',
      '/advanced-analytics': 'ai-analytics',
    };

    return pathMap[pathname] || 'dashboard';
  };

  const activeSection =
    propActiveSection || getActiveSectionFromPath(location.pathname);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
