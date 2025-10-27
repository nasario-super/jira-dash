import React, { useState } from 'react';
import { useAuth } from '../../stores/authStore';
import { useTestConnectionMutation } from '../../hooks/useJiraQueries';
import {
  JiraCredentialsSchema,
  validateCredentials,
} from '../../schemas/validation';
import { JiraApiConfig } from '../../types/jira.types';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const testConnectionMutation = useTestConnectionMutation();
  const [formData, setFormData] = useState({
    domain: '',
    email: '',
    apiToken: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    // Limpar erro específico do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    console.log('Validating form data:', formData);
    const validation = validateCredentials(formData);
    console.log('Validation result:', validation);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.forEach(err => {
        fieldErrors[err.field] = err.message;
      });
      console.log('Validation errors:', fieldErrors);
      setErrors(fieldErrors);
      return false;
    }
    console.log('Validation passed');
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('🔐 Login attempt with:', {
      domain: formData.domain.trim(),
      email: formData.email.trim(),
      tokenLength: formData.apiToken.length,
    });

    console.log('Form validation passed, starting connection test...');
    setError(null);

    const credentials: JiraApiConfig = {
      domain: formData.domain.trim(),
      email: formData.email.trim(),
      apiToken: formData.apiToken.trim(),
    };

    console.log('Testing connection with credentials:', {
      ...credentials,
      apiToken: '***',
    });

    testConnectionMutation.mutate(credentials, {
      onSuccess: isConnected => {
        console.log('Connection test result:', isConnected);
        if (isConnected) {
          login(credentials);
          onLoginSuccess?.();
        } else {
          setError('Falha na conexão. Verifique suas credenciais.');
        }
      },
      onError: (err: any) => {
        console.error('Login error:', err);
        setError(
          'Erro ao conectar com o Jira. Verifique suas credenciais e tente novamente.'
        );
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Jira Dashboard</h2>
          <p className="mt-2 text-sm text-gray-600">
            Conecte-se ao seu Jira para acessar o dashboard
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="domain"
                className="block text-sm font-medium text-gray-700"
              >
                Domínio do Jira
              </label>
              <div className="mt-1">
                <input
                  id="domain"
                  name="domain"
                  type="text"
                  required
                  value={formData.domain}
                  onChange={handleInputChange}
                  placeholder="sua-empresa.atlassian.net"
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.domain ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.domain && (
                <p className="mt-1 text-xs text-red-600">{errors.domain}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Exemplo: sua-empresa.atlassian.net
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu-email@empresa.com"
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="apiToken"
                className="block text-sm font-medium text-gray-700"
              >
                API Token
              </label>
              <div className="mt-1">
                <input
                  id="apiToken"
                  name="apiToken"
                  type="password"
                  required
                  value={formData.apiToken}
                  onChange={handleInputChange}
                  placeholder="Seu API Token do Jira"
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.apiToken ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.apiToken && (
                <p className="mt-1 text-xs text-red-600">{errors.apiToken}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Como gerar um API Token
                </a>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={testConnectionMutation.isPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testConnectionMutation.isPending ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Conectando...
                  </div>
                ) : (
                  'Conectar ao Jira'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Informações</span>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500 space-y-2">
              <p>
                <strong>Domínio:</strong> O domínio da sua instância do Jira
                (ex: empresa.atlassian.net)
              </p>
              <p>
                <strong>Email:</strong> Seu email de usuário no Jira
              </p>
              <p>
                <strong>API Token:</strong> Token gerado nas configurações de
                segurança da sua conta Atlassian
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
