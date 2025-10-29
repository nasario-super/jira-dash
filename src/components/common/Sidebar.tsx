// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  Diamond,
  BarChart3,
  Brain,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  badgeColor?: string;
  href?: string;
  children?: NavigationItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection = 'dashboard',
  onSectionChange,
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Debug log
  console.log('🔍 Sidebar rendering:', {
    activeSection,
    isCollapsed,
    isMobileMenuOpen,
  });

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/',
    },
    {
      id: 'agile',
      label: 'Agile',
      icon: Calendar,
      badge: 'Novo',
      badgeColor: 'bg-green-100 text-green-800',
      href: '/agile',
    },
    {
      id: 'executive',
      label: 'Executive',
      icon: TrendingUp,
      badge: '3',
      badgeColor: 'bg-blue-100 text-blue-800',
      href: '/executive',
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileText,
      href: '/reports',
    },
    {
      id: 'slack',
      label: 'Slack',
      icon: MessageSquare,
      badge: 'Beta',
      badgeColor: 'bg-purple-100 text-purple-800',
      href: '/slack',
    },
    {
      id: 'quality',
      label: 'Qualidade',
      icon: Diamond,
      href: '/quality',
    },
    {
      id: 'analytics',
      label: 'Análises',
      icon: BarChart3,
      badge: '5',
      badgeColor: 'bg-orange-100 text-orange-800',
      href: '/analytics',
    },
    {
      id: 'ai-analytics',
      label: 'Analytics IA',
      icon: Brain,
      badge: 'IA',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      href: '/advanced-analytics',
    },
  ];

  const handleItemClick = (item: NavigationItem) => {
    console.log('🔍 Sidebar item clicked:', item);

    // Navegar para a rota correspondente
    if (item.href) {
      navigate(item.href);
    }

    // Callback para atualizar seção ativa
    if (onSectionChange) {
      onSectionChange(item.id);
    }

    setIsMobileMenuOpen(false);
  };

  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1,
      },
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50
          shadow-lg lg:shadow-none
          ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full lg:translate-x-0'
          }
          ${className}
        `}
        style={{ zIndex: 50 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <motion.div
              variants={contentVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Dashboard Jira
                  </h1>
                  <p className="text-xs text-gray-500">
                    Visão executiva dos projetos
                  </p>
                </div>
              )}
            </motion.div>

            {/* Collapse Button - Desktop Only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item : any) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`
                      w-full justify-start h-12 px-3
                      ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${isCollapsed ? 'px-2' : ''}
                    `}
                    onClick={() => handleItemClick(item)}
                  >
                    <Icon
                      className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                    />

                    <motion.div
                      variants={contentVariants}
                      animate={isCollapsed ? 'collapsed' : 'expanded'}
                      className="flex items-center justify-between w-full"
                    >
                      {!isCollapsed && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                item.badgeColor || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </motion.div>
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {/* Refresh Button */}
            <motion.div
              variants={contentVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
            >
              <Button
                variant="outline"
                className="w-full justify-start h-10"
                onClick={() => console.log('Refresh clicked')}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                />
                {!isCollapsed && <span>Atualizar</span>}
              </Button>
            </motion.div>

            {/* User Info */}
            <motion.div
              variants={contentVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    anderson.nasario@superlogica.com
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    superlogica.atlassian.net
                  </p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              variants={contentVariants}
              animate={isCollapsed ? 'collapsed' : 'expanded'}
              className="flex space-x-2"
            >
              <Button variant="ghost" size="sm" className="flex-1">
                <Settings className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Config</span>}
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <Bell className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Notif</span>}
              </Button>
              <Button variant="ghost" size="sm" className="flex-1">
                <LogOut className="w-4 h-4" />
                {!isCollapsed && <span className="ml-2">Sair</span>}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Spacer for desktop */}
      <div className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-70'}`} />
    </>
  );
};

export default Sidebar;
