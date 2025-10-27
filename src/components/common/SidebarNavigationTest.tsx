import React, { useState } from 'react';
import Layout from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useLocation } from 'react-router-dom';

const SidebarNavigationTest: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const location = useLocation();

  const handleSectionChange = (section: string) => {
    console.log('🔍 Section changed to:', section);
    setActiveSection(section);
  };

  return (
    <Layout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      onRefresh={() => console.log('Refresh clicked')}
      isRefreshing={false}
      lastUpdated={new Date()}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Teste de Navegação da Sidebar</span>
              <Badge variant="outline">Debug</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Informações Atuais
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      <strong>URL Atual:</strong> {location.pathname}
                    </li>
                    <li>
                      <strong>Seção Ativa:</strong> {activeSection}
                    </li>
                    <li>
                      <strong>Timestamp:</strong>{' '}
                      {new Date().toLocaleTimeString()}
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Instruções
                  </h3>
                  <ol className="text-sm text-green-800 space-y-1">
                    <li>1. Clique nos itens da Sidebar</li>
                    <li>2. Verifique se a URL muda</li>
                    <li>3. Verifique se a seção ativa muda</li>
                    <li>4. Observe os logs no console</li>
                  </ol>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Status da Navegação
                </h3>
                <div className="text-sm text-yellow-800">
                  <p>
                    Se você conseguir navegar entre as seções, a Sidebar está
                    funcionando corretamente!
                  </p>
                  <p className="mt-2">
                    <strong>Próximo passo:</strong> Teste navegando para
                    diferentes páginas usando a Sidebar.
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setActiveSection('dashboard')}
                  variant={
                    activeSection === 'dashboard' ? 'default' : 'outline'
                  }
                >
                  Dashboard
                </Button>
                <Button
                  onClick={() => setActiveSection('agile')}
                  variant={activeSection === 'agile' ? 'default' : 'outline'}
                >
                  Agile
                </Button>
                <Button
                  onClick={() => setActiveSection('analytics')}
                  variant={
                    activeSection === 'analytics' ? 'default' : 'outline'
                  }
                >
                  Analytics
                </Button>
                <Button
                  onClick={() => setActiveSection('ai-analytics')}
                  variant={
                    activeSection === 'ai-analytics' ? 'default' : 'outline'
                  }
                >
                  AI Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SidebarNavigationTest;







