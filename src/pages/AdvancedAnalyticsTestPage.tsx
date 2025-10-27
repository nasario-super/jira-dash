import React, { useState } from 'react';
import Layout from '../components/common/Layout';
import AdvancedAnalyticsTest from '../components/analytics/AdvancedAnalyticsTest';
import AdvancedAnalyticsDebug from '../components/analytics/AdvancedAnalyticsDebug';
import { useJiraData } from '../hooks/useJiraData';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Bug, TestTube } from 'lucide-react';

const AdvancedAnalyticsTestPage: React.FC = () => {
  const { data, loading, error } = useJiraData();
  const issues = data?.issues || [];
  const [activeTab, setActiveTab] = useState<'test' | 'debug'>('test');

  return (
    <Layout
      onRefresh={() => window.location.reload()}
      isRefreshing={loading}
      lastUpdated={new Date()}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Analytics Test Suite
          </h1>
          <p className="text-gray-600">
            Teste completo das funcionalidades do Advanced Analytics
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">
              Error Loading Data
            </h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === 'test' ? 'default' : 'outline'}
                onClick={() => setActiveTab('test')}
                className="flex items-center space-x-2"
              >
                <TestTube className="w-4 h-4" />
                <span>Test Suite</span>
              </Button>
              <Button
                variant={activeTab === 'debug' ? 'default' : 'outline'}
                onClick={() => setActiveTab('debug')}
                className="flex items-center space-x-2"
              >
                <Bug className="w-4 h-4" />
                <span>Debug Mode</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tab Content */}
        {activeTab === 'test' && (
          <AdvancedAnalyticsTest issues={issues} loading={loading} />
        )}

        {activeTab === 'debug' && (
          <AdvancedAnalyticsDebug issues={issues} loading={loading} />
        )}
      </div>
    </Layout>
  );
};

export default AdvancedAnalyticsTestPage;
