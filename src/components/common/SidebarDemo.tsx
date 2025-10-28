import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  Home,
} from 'lucide-react';

const SidebarDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'blue' },
    { id: 'agile', label: 'Agile', icon: Calendar, color: 'green' },
    { id: 'executive', label: 'Executive', icon: TrendingUp, color: 'purple' },
    { id: 'reports', label: 'Relatórios', icon: FileText, color: 'orange' },
    { id: 'slack', label: 'Slack', icon: MessageSquare, color: 'pink' },
    { id: 'quality', label: 'Qualidade', icon: Diamond, color: 'yellow' },
    { id: 'analytics', label: 'Análises', icon: BarChart3, color: 'indigo' },
    { id: 'ai-analytics', label: 'Analytics IA', icon: Brain, color: 'red' },
  ];

  const getSectionInfo = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    return section || sections[0];
  };

  const currentSection = getSectionInfo(activeSection);

  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onRefresh={() => console.log('Refresh clicked')}
      isRefreshing={false}
      lastUpdated={new Date()}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentSection.label}
              </h1>
              <p className="text-gray-600 mt-1">
                Demonstração da Sidebar com navegação entre seções
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Seção Ativa: {activeSection}
            </Badge>
          </div>
        </div>

        {/* Content based on active section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-${section.color}-100`}>
                        <Icon className={`w-5 h-5 text-${section.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {section.label}
                        </CardTitle>
                        {isActive && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Clique para navegar para a seção{' '}
                      {section.label.toLowerCase()}.
                    </p>
                    <div className="mt-4">
                      <Button
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveSection(section.id)}
                      >
                        {isActive ? 'Seção Ativa' : 'Navegar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Current Section Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <currentSection.icon
                  className={`w-5 h-5 text-${currentSection.color}-600`}
                />
                <span>Informações da Seção Ativa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Detalhes</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>
                      <strong>ID:</strong> {currentSection.id}
                    </li>
                    <li>
                      <strong>Label:</strong> {currentSection.label}
                    </li>
                    <li>
                      <strong>Cor:</strong> {currentSection.color}
                    </li>
                    <li>
                      <strong>Status:</strong> Ativo
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Funcionalidades
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Navegação lateral responsiva</li>
                    <li>• Modo colapsado/expandido</li>
                    <li>• Badges informativos</li>
                    <li>• Animações suaves</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SidebarDemo;








