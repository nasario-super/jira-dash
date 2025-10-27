import React, { useState } from 'react';
import LayoutSimple from './LayoutSimple';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

const SidebarTest: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <LayoutSimple
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onRefresh={() => console.log('Refresh')}
      isRefreshing={false}
      lastUpdated={new Date()}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Teste da Sidebar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Esta é uma página de teste para verificar se a Sidebar está
                funcionando corretamente.
              </p>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Seção Ativa:
                </h3>
                <p className="text-blue-700">{activeSection}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutSimple>
  );
};

export default SidebarTest;
