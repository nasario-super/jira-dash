import React from 'react';
import { AlertTriangle, RefreshCw, Settings, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface JiraConnectionErrorProps {
  error: string;
  onRetry: () => void;
  onOpenSettings: () => void;
}

const JiraConnectionError: React.FC<JiraConnectionErrorProps> = ({
  error,
  onRetry,
  onOpenSettings,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Erro de Conexão com Jira
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Não foi possível conectar ao Jira. Verifique sua configuração.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">
              Detalhes do Erro:
            </h3>
            <p className="text-red-700 text-sm font-mono">{error}</p>
          </div>

          {/* Possible Causes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Possíveis Causas:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Wifi className="h-4 w-4 mt-0.5 text-gray-400" />
                <span>Verifique sua conexão com a internet</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="h-4 w-4 mt-0.5 text-gray-400" />
                <span>Verifique se o domínio do Jira está correto</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 text-gray-400" />
                <span>
                  Verifique se suas credenciais (email e token) estão corretas
                </span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 mt-0.5 text-gray-400" />
                <span>Verifique se o Jira está online e acessível</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onRetry}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar Novamente
            </Button>
            <Button
              variant="outline"
              onClick={onOpenSettings}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            <p>
              Se o problema persistir, entre em contato com o administrador do
              sistema ou verifique a documentação do Jira API.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JiraConnectionError;
