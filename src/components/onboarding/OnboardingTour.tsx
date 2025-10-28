import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Circle,
  Target,
  MousePointer,
  Keyboard,
  Eye,
  Volume2,
} from 'lucide-react';
import { useAccessibility } from '../../hooks/useAccessibility';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'focus' | 'scroll';
  highlight?: boolean;
  interactive?: boolean;
  accessibility?: {
    announce?: string;
    keyboardHint?: string;
    screenReaderText?: string;
  };
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { announce, focusElement, settings } = useAccessibility();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [highlightedElement, setHighlightedElement] =
    useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Jira Dashboard!',
      description:
        'Vamos fazer um tour rápido para você conhecer as principais funcionalidades.',
      target: 'body',
      position: 'center',
      accessibility: {
        announce: 'Bem-vindo ao Jira Dashboard. Iniciando tour de introdução.',
        screenReaderText:
          'Este é o tour de introdução do Jira Dashboard. Use as setas para navegar ou Tab para pular para o próximo passo.',
      },
    },
    {
      id: 'navigation',
      title: 'Navegação Principal',
      description:
        'Use esta barra de navegação para acessar diferentes seções do dashboard.',
      target: 'nav, [role="navigation"]',
      position: 'bottom',
      action: 'focus',
      highlight: true,
      accessibility: {
        announce:
          'Barra de navegação principal. Use Tab para navegar entre os itens.',
        keyboardHint: 'Use Tab para navegar entre os itens do menu',
      },
    },
    {
      id: 'filters',
      title: 'Sistema de Filtros',
      description:
        'Aqui você pode filtrar issues por status, prioridade, assignee e muito mais.',
      target: '.filter-panel, [data-testid="filters"]',
      position: 'right',
      action: 'click',
      highlight: true,
      interactive: true,
      accessibility: {
        announce: 'Sistema de filtros. Clique para abrir e filtrar issues.',
        keyboardHint: 'Pressione Enter para abrir os filtros',
      },
    },
    {
      id: 'metrics',
      title: 'Métricas de Performance',
      description:
        'Visualize KPIs importantes como velocidade, throughput e tempo de ciclo.',
      target: '.metrics-grid, [data-testid="metrics"]',
      position: 'top',
      highlight: true,
      accessibility: {
        announce:
          'Métricas de performance. Use as setas para navegar entre os cards.',
        screenReaderText:
          'Cards de métricas mostrando velocidade, throughput e outros indicadores de performance.',
      },
    },
    {
      id: 'charts',
      title: 'Gráficos Interativos',
      description:
        'Explore dados visuais clicando nos gráficos para ver detalhes específicos.',
      target: '.chart-container, [data-testid="charts"]',
      position: 'left',
      action: 'hover',
      highlight: true,
      interactive: true,
      accessibility: {
        announce: 'Gráficos interativos. Clique para explorar os dados.',
        keyboardHint: 'Use Tab para focar nos gráficos e Enter para interagir',
      },
    },
    {
      id: 'analytics',
      title: 'Análises Avançadas',
      description:
        'Acesse insights automáticos, análises preditivas e detecção de anomalias.',
      target: 'a[href*="analytics"], [data-testid="analytics-button"]',
      position: 'bottom',
      action: 'click',
      highlight: true,
      accessibility: {
        announce:
          'Botão de análises avançadas. Clique para acessar insights e previsões.',
        keyboardHint: 'Pressione Enter para abrir a página de análises',
      },
    },
    {
      id: 'accessibility',
      title: 'Configurações de Acessibilidade',
      description:
        'Personalize a experiência com configurações de acessibilidade.',
      target: '[data-testid="accessibility-button"], .accessibility-toggle',
      position: 'top',
      action: 'click',
      highlight: true,
      accessibility: {
        announce:
          'Configurações de acessibilidade. Personalize sua experiência.',
        keyboardHint: 'Pressione Enter para abrir as configurações',
      },
    },
    {
      id: 'complete',
      title: 'Tour Concluído!',
      description:
        'Agora você conhece as principais funcionalidades. Explore e personalize sua experiência!',
      target: 'body',
      position: 'center',
      accessibility: {
        announce:
          'Tour concluído! Você está pronto para usar o Jira Dashboard.',
        screenReaderText:
          'Parabéns! Você concluiu o tour. Use Tab para navegar e explore as funcionalidades.',
      },
    },
  ];

  const currentStepData = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    if (isOpen && currentStepData) {
      // Announce step
      if (currentStepData.accessibility?.announce) {
        announce(currentStepData.accessibility.announce);
      }

      // Focus target element if specified
      if (
        currentStepData.target !== 'body' &&
        currentStepData.action === 'focus'
      ) {
        setTimeout(() => {
          const element = document.querySelector(
            currentStepData.target
          ) as HTMLElement;
          if (element) {
            element.focus();
            setHighlightedElement(element);
          }
        }, 100);
      }
    }
  }, [isOpen, currentStep, currentStepData, announce]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setHighlightedElement(null);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    announce('Tour concluído com sucesso!');
    onComplete();
  };

  const skipTour = () => {
    announce('Tour cancelado');
    onClose();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    announce(isPlaying ? 'Tour pausado' : 'Tour em reprodução');
  };

  const resetTour = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
    announce('Tour reiniciado');
  };

  const handleStepAction = () => {
    if (currentStepData?.interactive && currentStepData.target !== 'body') {
      const element = document.querySelector(
        currentStepData.target
      ) as HTMLElement;
      if (element) {
        if (currentStepData.action === 'click') {
          element.click();
        } else if (currentStepData.action === 'focus') {
          element.focus();
        }
      }
    }
    nextStep();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={skipTour}
      />

      {/* Highlighted Element */}
      {highlightedElement && currentStepData?.highlight && (
        <div
          className="absolute border-4 border-blue-500 rounded-lg pointer-events-none animate-pulse"
          style={{
            top: highlightedElement.offsetTop - 4,
            left: highlightedElement.offsetLeft - 4,
            width: highlightedElement.offsetWidth + 8,
            height: highlightedElement.offsetHeight + 8,
          }}
        />
      )}

      {/* Tour Card */}
      <div
        ref={stepRef}
        className="absolute bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{
          top: currentStepData?.position === 'center' ? '50%' : '20%',
          left: currentStepData?.position === 'center' ? '50%' : '20%',
          transform:
            currentStepData?.position === 'center'
              ? 'translate(-50%, -50%)'
              : 'none',
        }}
      >
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Tour Interativo
                <Badge variant="secondary">
                  {currentStep + 1} de {tourSteps.length}
                </Badge>
              </CardTitle>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? 'Pausar tour' : 'Reproduzir tour'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetTour}
                  aria-label="Reiniciar tour"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  aria-label="Fechar tour"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentStepData?.title}
                </h3>
                <p className="text-gray-600">{currentStepData?.description}</p>
              </div>

              {/* Accessibility Info */}
              {currentStepData?.accessibility?.screenReaderText && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      {currentStepData.accessibility.screenReaderText}
                    </p>
                  </div>
                </div>
              )}

              {/* Keyboard Hint */}
              {currentStepData?.accessibility?.keyboardHint && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Keyboard className="w-4 h-4 text-gray-600 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {currentStepData.accessibility.keyboardHint}
                    </p>
                  </div>
                </div>
              )}

              {/* Step Indicators */}
              <div className="flex items-center justify-center gap-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : completedSteps.has(index)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2">
                  {currentStepData?.interactive && (
                    <Button
                      onClick={handleStepAction}
                      className="flex items-center gap-2"
                    >
                      <MousePointer className="w-4 h-4" />
                      Interagir
                    </Button>
                  )}

                  <Button
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Concluir
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingTour;













