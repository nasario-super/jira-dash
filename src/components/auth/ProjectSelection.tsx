// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useJiraApi } from '../../hooks/useJiraApi';
import { projectAccessService } from '../../services/projectAccessService';
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';

interface Project {
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
  projectCategory?: {
    id: string;
    name: string;
    description: string;
  };
}

interface ProjectSelectionProps {
  onProjectsSelected: (projects: string[]) => void;
  onSkip: () => void;
}

export const ProjectSelection: React.FC<ProjectSelectionProps> = ({
  onProjectsSelected,
  onSkip,
}) => {
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingAccess, setTestingAccess] = useState<string | null>(null);
  const [accessResults, setAccessResults] = useState<Record<string, boolean>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [discoveryStatus, setDiscoveryStatus] = useState<
    'idle' | 'discovering' | 'completed' | 'error'
  >('idle');
  const jiraApi = useJiraApi();

  // Filtrar projetos baseado na pesquisa
  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableProjects;
    }

    const term = searchTerm.toLowerCase();
    return availableProjects.filter(
      project =>
        project.key.toLowerCase().includes(term) ||
        project.name.toLowerCase().includes(term)
    );
  }, [availableProjects, searchTerm]);

  // Carregar projetos disponíveis
  useEffect(() => {
    loadAvailableProjects();
  }, []);

  const loadAvailableProjects = async () => {
    setLoading(true);
    setError(null);
    setDiscoveryStatus('discovering');

    try {
      console.log('🔍 Loading available projects with discovery...');

      // Primeiro, tentar descoberta automática
      console.log('🔍 Starting automatic project discovery...');
      setDiscoveryStatus('discovering');

      try {
        const currentUserEmail = 'anderson.nasario@superlogica.com'; // TODO: Obter do contexto de auth

        // Verificar se já há projetos configurados manualmente
        if (
          projectAccessService.isInitialized() &&
          projectAccessService.isManualSelection()
        ) {
          console.log(
            '🔍 Manual selection already configured, skipping discovery'
          );
          const manualProjects = projectAccessService.getUserProjects();
          console.log('🔍 Using manually selected projects:', manualProjects);

          // Usar projetos já selecionados manualmente
          const manualProjectData = await Promise.all(
            manualProjects.map(async projectKey => {
              try {
                const projectData = await jiraApi.getProject(projectKey);
                return projectData;
              } catch (error) {
                console.warn(
                  `⚠️ Could not fetch details for project ${projectKey}:`,
                  error
                );
                return null;
              }
            })
          );

          const validProjects = manualProjectData.filter(
            project => project !== null
          ) as Project[];
          setAvailableProjects(validProjects);
          setDiscoveryStatus('completed');
          console.log(
            `✅ Using ${validProjects.length} manually selected projects`
          );
          return;
        }

        // Se não há seleção manual, fazer descoberta automática
        // Mas primeiro verificar se já há projetos configurados
        if (
          !projectAccessService.isInitialized() ||
          projectAccessService.getUserProjects().length === 0
        ) {
          console.log('🔍 No projects configured, starting discovery...');
          await projectAccessService.discoverUserProjects(
            currentUserEmail,
            jiraApi
          );
        } else {
          console.log('🔍 Projects already configured, skipping discovery');
          console.log(
            '🔍 Current projects:',
            projectAccessService.getUserProjects()
          );
        }

        const discoveredProjects = projectAccessService.getUserProjects();
        console.log(
          '🔍 Discovery completed, found projects:',
          discoveredProjects
        );

        if (discoveredProjects.length > 0) {
          // Usar projetos descobertos
          const discoveredProjectData = await Promise.all(
            discoveredProjects.map(async projectKey => {
              try {
                const projectData = await jiraApi.getProject(projectKey);
                return projectData;
              } catch (error) {
                console.warn(
                  `⚠️ Could not fetch details for project ${projectKey}:`,
                  error
                );
                return null;
              }
            })
          );

          const validProjects = discoveredProjectData.filter(
            project => project !== null
          ) as Project[];
          setAvailableProjects(validProjects);
          setDiscoveryStatus('completed');
          console.log(
            `✅ Discovery found ${validProjects.length} accessible projects`
          );
          return;
        } else {
          throw new Error('No projects found through discovery');
        }
      } catch (discoveryError) {
        console.warn(
          '⚠️ Discovery failed, falling back to API:',
          discoveryError
        );
      }

      // Fallback: tentar carregar projetos via API
      try {
        const projects = await jiraApi.getProjects();

        if (projects && projects.length > 0) {
          console.log(`✅ Found ${projects.length} projects via API`);
          setAvailableProjects(projects as Project[]);
          setDiscoveryStatus('completed');
          return;
        }
      } catch (apiError) {
        console.warn('⚠️ API failed, using known projects:', apiError);
      }

      // Fallback para projetos conhecidos
      console.log('⚠️ No projects found via API, using known projects');
      const knownProjects: Project[] = [
        {
          key: 'INFOSECC',
          name: '[Sec] Segurança da Informação',
          projectTypeKey: 'software',
          avatarUrls: {
            '16x16': '',
            '24x24': '',
            '32x32': '',
            '48x48': '',
          },
        },
        {
          key: 'SEGP',
          name: '[Sec] Segurança & Privacidade',
          projectTypeKey: 'software',
          avatarUrls: {
            '16x16': '',
            '24x24': '',
            '32x32': '',
            '48x48': '',
          },
        },
        {
          key: 'TS',
          name: 'Template Service',
          projectTypeKey: 'software',
          avatarUrls: {
            '16x16': '',
            '24x24': '',
            '32x32': '',
            '48x48': '',
          },
        },
        {
          key: 'TRE',
          name: 'AI Docs Elevate',
          projectTypeKey: 'software',
          avatarUrls: {
            '16x16': '',
            '24x24': '',
            '32x32': '',
            '48x48': '',
          },
        },
        {
          key: 'CRMS',
          name: 'CRM System',
          projectTypeKey: 'software',
          avatarUrls: {
            '16x16': '',
            '24x24': '',
            '32x32': '',
            '48x48': '',
          },
        },
        {
          key: 'PPD',
          name: 'Product Development',
          projectTypeKey: 'software',
          avatarUrls: {
            '16x16': '',
            '24x24': '',
            '32x32': '',
            '48x48': '',
          },
        },
        {
          key: 'GCD',
          name: 'Global Content Delivery',
          projectTypeKey: 'software',
          avatarUrls: {
            '16x16': '',
            '24x24': '',
            '32x32': '',
            '48x48': '',
          },
        },
      ];
      setAvailableProjects(knownProjects);
      setDiscoveryStatus('error');
    } catch (err: any) {
      console.error('❌ Error loading projects:', err);
      setError('Erro ao carregar projetos. Usando lista padrão.');

      // Usar projetos conhecidos como fallback
      const knownProjects: Project[] = [
        {
          key: 'INFOSECC',
          name: '[Sec] Segurança da Informação',
          projectTypeKey: 'software',
          avatarUrls: { '16x16': '', '24x24': '', '32x32': '', '48x48': '' },
        },
        {
          key: 'SEGP',
          name: 'Segurança & Privacidade',
          projectTypeKey: 'software',
          avatarUrls: { '16x16': '', '24x24': '', '32x32': '', '48x48': '' },
        },
        {
          key: 'TS',
          name: 'Template Service',
          projectTypeKey: 'software',
          avatarUrls: { '16x16': '', '24x24': '', '32x32': '', '48x48': '' },
        },
        {
          key: 'TRE',
          name: 'AI Docs Elevate',
          projectTypeKey: 'software',
          avatarUrls: { '16x16': '', '24x24': '', '32x32': '', '48x48': '' },
        },
        {
          key: 'CRMS',
          name: 'CRM System',
          projectTypeKey: 'software',
          avatarUrls: { '16x16': '', '24x24': '', '32x32': '', '48x48': '' },
        },
        {
          key: 'PPD',
          name: 'Product Development',
          projectTypeKey: 'software',
          avatarUrls: { '16x16': '', '24x24': '', '32x32': '', '48x48': '' },
        },
        {
          key: 'GCD',
          name: 'Global Content Delivery',
          projectTypeKey: 'software',
          avatarUrls: { '16x16': '', '24x24': '', '32x32': '', '48x48': '' },
        },
      ];
      setAvailableProjects(knownProjects);
    } finally {
      setLoading(false);
    }
  };

  const toggleProjectSelection = (projectKey: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectKey)
        ? prev.filter(key => key !== projectKey)
        : [...prev, projectKey]
    );
  };

  const testProjectAccess = async (projectKey: string) => {
    setTestingAccess(projectKey);

    try {
      console.log(`🔍 Testing access to project: ${projectKey}`);

      // Tentar buscar issues do projeto para testar acesso
      const testJql = `project = "${projectKey}"`;
      const testIssues = await jiraApi.getIssues(testJql, 0, 1);

      const hasAccess = testIssues !== null && testIssues.length >= 0;
      setAccessResults(prev => ({ ...prev, [projectKey]: hasAccess }));

      console.log(
        `✅ Access test for ${projectKey}: ${hasAccess ? 'GRANTED' : 'DENIED'}`
      );
    } catch (error) {
      console.warn(`❌ Access test failed for ${projectKey}:`, error);
      setAccessResults(prev => ({ ...prev, [projectKey]: false }));
    } finally {
      setTestingAccess(null);
    }
  };

  const testAllProjects = async () => {
    console.log('🔍 Testing access to all projects...');

    for (const project of availableProjects) {
      await testProjectAccess(project.key);
    }
    console.log('✅ All projects access tests completed.');
  };

  const handleConfirmSelection = () => {
    if (selectedProjects.length === 0) {
      alert('Por favor, selecione pelo menos um projeto.');
      return;
    }
    console.log('✅ Projects selected:', selectedProjects);

    // Configurar o serviço de acesso com os projetos selecionados
    projectAccessService.initializeUserProjects(
      'anderson.nasario@superlogica.com', // TODO: Obter do contexto de auth
      selectedProjects
    );

    onProjectsSelected(selectedProjects);
  };

  const handleSkip = () => {
    console.log('⚠️ Project selection skipped');
    onSkip();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Carregando Projetos
          </h2>
          <p className="text-gray-600 mb-4">
            {discoveryStatus === 'discovering'
              ? 'Descobrindo projetos acessíveis no Jira...'
              : 'Buscando projetos disponíveis no Jira...'}
          </p>
          {discoveryStatus === 'discovering' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-800">
                  Executando descoberta automática de projetos...
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Isso pode levar alguns segundos. Aguarde...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Seleção de Projetos
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Selecione os projetos do Jira que você deseja visualizar no
            dashboard. Apenas dados dos projetos selecionados serão exibidos.
          </p>
        </div>

        {/* Status da Descoberta */}
        {discoveryStatus === 'completed' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">
                Descoberta de Projetos Concluída
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {availableProjects.length} projetos acessíveis encontrados.
              Selecione os que deseja visualizar.
            </p>
          </div>
        )}

        {discoveryStatus === 'error' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">
                Descoberta Automática Falhou
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Usando lista padrão de projetos. Você pode testar o acesso a cada
              projeto.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">{error}</span>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar projetos por nome ou chave..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchTerm && (
            <div className="text-center mt-2 text-sm text-gray-600">
              {filteredProjects.length} de {availableProjects.length} projetos
              encontrados
            </div>
          )}
        </div>

        {/* Test All Button */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={testAllProjects}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Testar Acesso a Todos os Projetos
          </button>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? `Nenhum projeto corresponde a "${searchTerm}". Tente um termo diferente.`
                : 'Nenhum projeto disponível no momento.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredProjects.map(project => {
              const isSelected = selectedProjects.includes(project.key);
              const isTesting = testingAccess === project.key;
              const hasAccess = accessResults[project.key];
              const accessStatus = hasAccess !== undefined;

              return (
                <div
                  key={project.key}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleProjectSelection(project.key)}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 right-3">
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="pr-8">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {project.key}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.name}
                    </p>

                    {/* Access Status */}
                    <div className="flex items-center space-x-2">
                      {isTesting ? (
                        <div className="flex items-center text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          <span className="text-xs">Testando...</span>
                        </div>
                      ) : accessStatus ? (
                        <div
                          className={`flex items-center ${
                            hasAccess ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {hasAccess ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mr-1" />
                          )}
                          <span className="text-xs">
                            {hasAccess ? 'Acesso OK' : 'Sem Acesso'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            testProjectAccess(project.key);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 underline"
                        >
                          Testar Acesso
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selection Summary */}
        {selectedProjects.length > 0 && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">
              Projetos Selecionados ({selectedProjects.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedProjects.map(projectKey => {
                const project = availableProjects.find(
                  p => p.key === projectKey
                );
                return (
                  <span
                    key={projectKey}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {project?.name || projectKey}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handleConfirmSelection}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={selectedProjects.length === 0}
          >
            Confirmar Seleção ({selectedProjects.length})
          </button>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
          >
            Pular por enquanto
          </button>
        </div>

        {/* Tip */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 <strong>Dica:</strong> Use "Testar Acesso" para verificar se você
            tem permissão para acessar cada projeto. Apenas projetos com acesso
            confirmado devem ser selecionados.
          </p>
        </div>
      </div>
    </div>
  );
};
