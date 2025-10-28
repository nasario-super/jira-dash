import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  Activity,
  Download,
  Filter,
  Settings,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';
import { advancedAnalyticsService } from '../../services/advancedAnalyticsService';

interface AdvancedAnalyticsTestProps {
  issues: JiraIssue[];
  loading?: boolean;
}

const AdvancedAnalyticsTest: React.FC<AdvancedAnalyticsTestProps> = ({
  issues,
  loading = false,
}) => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setErrors([]);
    const newErrors: string[] = [];

    try {
      console.log('🧪 Running Advanced Analytics Tests...');

      // Test 1: Basic service functions
      try {
        const metrics =
          advancedAnalyticsService.calculateAdvancedMetrics(issues);
        console.log('✅ calculateAdvancedMetrics:', metrics.length);
      } catch (error) {
        newErrors.push(`calculateAdvancedMetrics: ${error}`);
        console.error('❌ calculateAdvancedMetrics failed:', error);
      }

      // Test 2: Correlations
      try {
        const correlations =
          advancedAnalyticsService.calculateCorrelations(issues);
        console.log('✅ calculateCorrelations:', correlations.length);
      } catch (error) {
        newErrors.push(`calculateCorrelations: ${error}`);
        console.error('❌ calculateCorrelations failed:', error);
      }

      // Test 3: Predictions
      try {
        const predictions =
          advancedAnalyticsService.calculatePredictions(issues);
        console.log('✅ calculatePredictions:', predictions.length);
      } catch (error) {
        newErrors.push(`calculatePredictions: ${error}`);
        console.error('❌ calculatePredictions failed:', error);
      }

      // Test 4: Benchmarks
      try {
        const benchmarks = advancedAnalyticsService.calculateBenchmarks(issues);
        console.log('✅ calculateBenchmarks:', benchmarks.length);
      } catch (error) {
        newErrors.push(`calculateBenchmarks: ${error}`);
        console.error('❌ calculateBenchmarks failed:', error);
      }

      // Test 5: Performance Optimizations
      try {
        const optimizations =
          advancedAnalyticsService.identifyOptimizations(issues);
        console.log('✅ identifyOptimizations:', optimizations.length);
      } catch (error) {
        newErrors.push(`identifyOptimizations: ${error}`);
        console.error('❌ identifyOptimizations failed:', error);
      }

      // Test 6: AI Insights
      try {
        const insights = advancedAnalyticsService.generateAIInsights(issues);
        console.log('✅ generateAIInsights:', insights.length);
      } catch (error) {
        newErrors.push(`generateAIInsights: ${error}`);
        console.error('❌ generateAIInsights failed:', error);
      }

      setTestResults({
        totalTests: 6,
        passedTests: 6 - newErrors.length,
        failedTests: newErrors.length,
        errors: newErrors,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      newErrors.push(`General test error: ${error}`);
      console.error('❌ General test error:', error);
    } finally {
      setIsRunning(false);
      setErrors(newErrors);
    }
  };

  useEffect(() => {
    if (issues && issues.length > 0) {
      runTests();
    }
  }, [issues]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <span>Advanced Analytics Test Suite</span>
            <Badge variant="outline" className="text-xs">
              {issues?.length || 0} issues
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Controls */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={runTests}
                disabled={isRunning || loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`}
                />
                <span>{isRunning ? 'Running Tests...' : 'Run Tests'}</span>
              </Button>

              {loading && (
                <Badge variant="outline" className="text-yellow-600">
                  Loading Data...
                </Badge>
              )}
            </div>

            {/* Test Results */}
            {testResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-800">
                        {testResults.passedTests}
                      </div>
                      <div className="text-sm text-green-600">Passed</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-800">
                        {testResults.failedTests}
                      </div>
                      <div className="text-sm text-red-600">Failed</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-800">
                        {testResults.totalTests}
                      </div>
                      <div className="text-sm text-blue-600">Total</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Test Errors</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {errors.map((error, index) => (
                          <div
                            key={index}
                            className="p-3 bg-red-100 rounded-lg text-sm text-red-800"
                          >
                            <strong>Error {index + 1}:</strong> {error}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Success Message */}
                {errors.length === 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">
                        All Tests Passed! 🎉
                      </h3>
                      <p className="text-green-600">
                        Advanced Analytics is working correctly.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Debug Info */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">
                  Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    <strong>Issues Count:</strong> {issues?.length || 0}
                  </div>
                  <div>
                    <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Test Running:</strong> {isRunning ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Last Run:</strong>{' '}
                    {testResults?.timestamp || 'Never'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsTest;








