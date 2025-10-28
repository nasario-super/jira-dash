import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import {
  Bug,
  CheckCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Activity,
  Database,
  Code,
  Zap,
} from 'lucide-react';
import { JiraIssue } from '../../types/jira.types';
import { advancedAnalyticsService } from '../../services/advancedAnalyticsService';

interface AdvancedAnalyticsDebugProps {
  issues: JiraIssue[];
  loading?: boolean;
}

const AdvancedAnalyticsDebug: React.FC<AdvancedAnalyticsDebugProps> = ({
  issues,
  loading = false,
}) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [stepResults, setStepResults] = useState<any[]>([]);

  const runDebug = async () => {
    setIsDebugging(true);
    setStepResults([]);

    const steps = [
      {
        name: 'Check Issues Data',
        test: () => {
          console.log('🔍 Debug Step 1: Issues Data');
          return {
            success: true,
            message: `Found ${issues?.length || 0} issues`,
            data: {
              totalIssues: issues?.length || 0,
              sampleIssues:
                issues?.slice(0, 3).map(issue => ({
                  key: issue.key,
                  status: issue.fields.status.name,
                  type: issue.fields.issuetype.name,
                  created: issue.fields.created,
                })) || [],
            },
          };
        },
      },
      {
        name: 'Test Service Import',
        test: () => {
          console.log('🔍 Debug Step 2: Service Import');
          try {
            const service = advancedAnalyticsService;
            return {
              success: true,
              message: 'Service imported successfully',
              data: { serviceAvailable: !!service },
            };
          } catch (error) {
            return {
              success: false,
              message: `Service import failed: ${error}`,
              data: { error: String(error) },
            };
          }
        },
      },
      {
        name: 'Test calculateAdvancedMetrics',
        test: () => {
          console.log('🔍 Debug Step 3: calculateAdvancedMetrics');
          try {
            const metrics =
              advancedAnalyticsService.calculateAdvancedMetrics(issues);
            return {
              success: true,
              message: `Calculated ${metrics.length} metrics`,
              data: {
                metricsCount: metrics.length,
                metrics: metrics.slice(0, 2),
              },
            };
          } catch (error) {
            return {
              success: false,
              message: `calculateAdvancedMetrics failed: ${error}`,
              data: { error: String(error) },
            };
          }
        },
      },
      {
        name: 'Test calculateCorrelations',
        test: () => {
          console.log('🔍 Debug Step 4: calculateCorrelations');
          try {
            const correlations =
              advancedAnalyticsService.calculateCorrelations(issues);
            return {
              success: true,
              message: `Calculated ${correlations.length} correlations`,
              data: { correlationsCount: correlations.length },
            };
          } catch (error) {
            return {
              success: false,
              message: `calculateCorrelations failed: ${error}`,
              data: { error: String(error) },
            };
          }
        },
      },
      {
        name: 'Test calculatePredictions',
        test: () => {
          console.log('🔍 Debug Step 5: calculatePredictions');
          try {
            const predictions =
              advancedAnalyticsService.calculatePredictions(issues);
            return {
              success: true,
              message: `Calculated ${predictions.length} predictions`,
              data: { predictionsCount: predictions.length },
            };
          } catch (error) {
            return {
              success: false,
              message: `calculatePredictions failed: ${error}`,
              data: { error: String(error) },
            };
          }
        },
      },
      {
        name: 'Test calculateBenchmarks',
        test: () => {
          console.log('🔍 Debug Step 6: calculateBenchmarks');
          try {
            const benchmarks =
              advancedAnalyticsService.calculateBenchmarks(issues);
            return {
              success: true,
              message: `Calculated ${benchmarks.length} benchmarks`,
              data: { benchmarksCount: benchmarks.length },
            };
          } catch (error) {
            return {
              success: false,
              message: `calculateBenchmarks failed: ${error}`,
              data: { error: String(error) },
            };
          }
        },
      },
    ];

    const results = [];
    for (const step of steps) {
      try {
        const result = step.test();
        results.push({ ...result, step: step.name });
        setStepResults([...results]);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for visibility
      } catch (error) {
        results.push({
          success: false,
          message: `Step ${step.name} crashed: ${error}`,
          data: { error: String(error) },
          step: step.name,
        });
        setStepResults([...results]);
      }
    }

    setDebugInfo({
      totalSteps: steps.length,
      successfulSteps: results.filter(r => r.success).length,
      failedSteps: results.filter(r => !r.success).length,
      timestamp: new Date().toISOString(),
    });

    setIsDebugging(false);
  };

  useEffect(() => {
    if (issues && issues.length > 0) {
      runDebug();
    }
  }, [issues]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="w-5 h-5 text-red-600" />
            <span>Advanced Analytics Debug</span>
            <Badge variant="outline" className="text-xs">
              {issues?.length || 0} issues
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Debug Controls */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={runDebug}
                disabled={isDebugging || loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isDebugging ? 'animate-spin' : ''}`}
                />
                <span>{isDebugging ? 'Debugging...' : 'Run Debug'}</span>
              </Button>

              {loading && (
                <Badge variant="outline" className="text-yellow-600">
                  Loading Data...
                </Badge>
              )}
            </div>

            {/* Step Results */}
            {stepResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  Debug Steps
                </h3>
                {stepResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {result.success ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {result.step}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {result.message}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={result.success ? 'default' : 'destructive'}
                          >
                            {result.success ? 'PASS' : 'FAIL'}
                          </Badge>
                        </div>

                        {result.data && (
                          <div className="mt-3 p-3 bg-gray-100 rounded text-xs">
                            <pre className="text-gray-700 overflow-x-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Summary */}
            {debugInfo && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Debug Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {debugInfo.successfulSteps}
                      </div>
                      <div className="text-sm text-gray-600">Successful</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {debugInfo.failedSteps}
                      </div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {debugInfo.totalSteps}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-600">
                    <strong>Last Run:</strong> {debugInfo.timestamp}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalyticsDebug;








