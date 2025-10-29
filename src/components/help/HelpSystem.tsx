import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  Video,
  MessageCircle,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAccessibility } from '../../hooks/useAccessibility';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated: Date;
  relatedArticles: string[];
  videoUrl?: string;
  externalLinks?: Array<{
    title: string;
    url: string;
  }>;
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  context?: string; // Current page or feature context
}

const HelpSystem: React.FC<HelpSystemProps> = ({
  isOpen,
  onClose,
  context = 'dashboard',
}) => {
  const { announce } = useAccessibility();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const helpArticles: HelpArticle[] = [
    {
      id: 'getting-started',
      title: 'Primeiros Passos',
      content:
        'Aprenda os conceitos básicos do Jira Dashboard e como navegar pela interface.',
      category: 'getting-started',
      tags: ['início', 'navegação', 'básico'],
      difficulty: 'beginner',
      lastUpdated: new Date('2024-01-15'),
      relatedArticles: ['dashboard-overview', 'filters-guide'],
      videoUrl: 'https://example.com/video1',
    },
    {
      id: 'dashboard-overview',
      title: 'Visão Geral do Dashboard',
      content:
        'Entenda os diferentes componentes do dashboard e como interpretar as métricas.',
      category: 'dashboard',
      tags: ['dashboard', 'métricas', 'overview'],
      difficulty: 'beginner',
      lastUpdated: new Date('2024-01-15'),
      relatedArticles: ['metrics-explained', 'charts-guide'],
    },
    {
      id: 'filters-guide',
      title: 'Guia de Filtros',
      content:
        'Aprenda a usar o sistema de filtros avançados para encontrar issues específicas.',
      category: 'filters',
      tags: ['filtros', 'busca', 'organização'],
      difficulty: 'intermediate',
      lastUpdated: new Date('2024-01-15'),
      relatedArticles: ['search-tips', 'jql-guide'],
    },
    {
      id: 'analytics-guide',
      title: 'Análises Avançadas',
      content:
        'Explore insights automáticos, análises preditivas e detecção de anomalias.',
      category: 'analytics',
      tags: ['análises', 'insights', 'previsões'],
      difficulty: 'advanced',
      lastUpdated: new Date('2024-01-15'),
      relatedArticles: ['ai-insights', 'anomaly-detection'],
    },
    {
      id: 'accessibility-guide',
      title: 'Acessibilidade',
      content: 'Configure a interface para melhorar sua experiência de uso.',
      category: 'accessibility',
      tags: ['acessibilidade', 'configuração', 'personalização'],
      difficulty: 'beginner',
      lastUpdated: new Date('2024-01-15'),
      relatedArticles: ['keyboard-navigation', 'screen-reader'],
    },
    {
      id: 'troubleshooting',
      title: 'Solução de Problemas',
      content:
        'Resolva problemas comuns e encontre respostas para perguntas frequentes.',
      category: 'troubleshooting',
      tags: ['problemas', 'faq', 'solução'],
      difficulty: 'intermediate',
      lastUpdated: new Date('2024-01-15'),
      relatedArticles: ['error-messages', 'performance-issues'],
    },
  ];

  const categories = [
    { id: 'all', name: 'Todos', icon: BookOpen },
    { id: 'getting-started', name: 'Primeiros Passos', icon: Lightbulb },
    { id: 'dashboard', name: 'Dashboard', icon: BookOpen },
    { id: 'filters', name: 'Filtros', icon: Search },
    { id: 'analytics', name: 'Análises', icon: MessageCircle },
    { id: 'accessibility', name: 'Acessibilidade', icon: HelpCircle },
    { id: 'troubleshooting', name: 'Problemas', icon: AlertCircle },
  ];

  const filteredArticles = helpArticles.filter((article : any) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'all' || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return 'Desconhecido';
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const openArticle = (article: HelpArticle) => {
    setSelectedArticle(article);
    announce(`Abrindo artigo: ${article.title}`);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    announce('Fechando artigo');
  };

  useEffect(() => {
    if (isOpen) {
      announce('Sistema de ajuda aberto');
    }
  }, [isOpen, announce]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Sistema de Ajuda
              <Badge variant="secondary">
                {filteredArticles.length} artigos
              </Badge>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Fechar sistema de ajuda"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {selectedArticle ? (
            // Article View
            <div className="h-[70vh] overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      className={getDifficultyColor(selectedArticle.difficulty)}
                    >
                      {getDifficultyLabel(selectedArticle.difficulty)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Atualizado em{' '}
                      {selectedArticle.lastUpdated.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={closeArticle}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Voltar
                </Button>
              </div>

              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-6">
                  {selectedArticle.content}
                </p>

                {/* Video Section */}
                {selectedArticle.videoUrl && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Vídeo Tutorial
                    </h3>
                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                      <p className="text-gray-600 mb-2">
                        Vídeo tutorial disponível
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(selectedArticle.videoUrl, '_blank')
                        }
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Assistir Vídeo
                      </Button>
                    </div>
                  </div>
                )}

                {/* External Links */}
                {selectedArticle.externalLinks &&
                  selectedArticle.externalLinks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <ExternalLink className="w-5 h-5" />
                        Links Úteis
                      </h3>
                      <ul className="space-y-2">
                        {selectedArticle.externalLinks.map((link, index) => (
                          <li key={index}>
                            <Button
                              variant="ghost"
                              onClick={() => window.open(link.url, '_blank')}
                              className="flex items-center gap-2 text-left justify-start"
                            >
                              <ExternalLink className="w-4 h-4" />
                              {link.title}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Related Articles */}
                {selectedArticle.relatedArticles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">
                      Artigos Relacionados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedArticle.relatedArticles.map((articleId : any) => {
                        const article = helpArticles.find(
                          a => a.id === articleId
                        );
                        if (!article) return null;
                        return (
                          <Button
                            key={articleId}
                            variant="outline"
                            onClick={() => openArticle(article)}
                            className="flex items-center gap-2 text-left justify-start h-auto p-3"
                          >
                            <BookOpen className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{article.title}</div>
                              <div className="text-sm text-gray-500">
                                {article.content.substring(0, 100)}...
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Article List View
            <div className="h-[70vh] flex">
              {/* Sidebar */}
              <div className="w-1/3 border-r bg-gray-50 p-4">
                <div className="space-y-4">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Digite para buscar..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Categorias
                    </label>
                    <div className="space-y-1">
                      {categories.map((category : any) => (
                        <Button
                          key={category.id}
                          variant={
                            selectedCategory === category.id
                              ? 'default'
                              : 'ghost'
                          }
                          onClick={() => setSelectedCategory(category.id)}
                          className="w-full justify-start"
                        >
                          <category.icon className="w-4 h-4 mr-2" />
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum artigo encontrado</p>
                      <p className="text-sm">
                        Tente ajustar sua busca ou categoria
                      </p>
                    </div>
                  ) : (
                    filteredArticles.map((article : any) => (
                      <Card
                        key={article.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openArticle(article)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2">
                                {article.title}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {article.content}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getDifficultyColor(
                                    article.difficulty
                                  )}
                                >
                                  {getDifficultyLabel(article.difficulty)}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {article.tags.join(', ')}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {article.videoUrl && (
                                <Badge variant="outline" className="mb-2">
                                  <Video className="w-3 h-3 mr-1" />
                                  Vídeo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpSystem;













