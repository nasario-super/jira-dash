import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import {
  Accessibility,
  Eye,
  EyeOff,
  Type,
  Volume2,
  VolumeX,
  Keyboard,
  Mouse,
  Settings,
  Check,
  X,
} from 'lucide-react';
import { useAccessibility } from '../../hooks/useAccessibility';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings, announce } = useAccessibility();
  const [tempSettings, setTempSettings] = useState(settings);

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(tempSettings);
    announce('Configurações de acessibilidade salvas');
    onClose();
  };

  const handleReset = () => {
    setTempSettings(settings);
    announce('Configurações resetadas');
  };

  const handleCancel = () => {
    setTempSettings(settings);
    onClose();
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Pequeno', description: 'Mais compacto' },
    { value: 'medium', label: 'Médio', description: 'Padrão' },
    { value: 'large', label: 'Grande', description: 'Mais legível' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              Configurações de Acessibilidade
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              aria-label="Fechar configurações"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Visual Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Configurações Visuais
            </h3>

            <div className="space-y-4">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Alto Contraste</label>
                  <p className="text-xs text-gray-500">
                    Aumenta o contraste entre texto e fundo
                  </p>
                </div>
                <Switch
                  checked={tempSettings.highContrast}
                  onCheckedChange={checked =>
                    handleSettingChange('highContrast', checked)
                  }
                  aria-label="Ativar alto contraste"
                />
              </div>

              {/* Font Size */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tamanho da Fonte
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {fontSizeOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={
                        tempSettings.fontSize === option.value
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        handleSettingChange('fontSize', option.value)
                      }
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Type className="w-4 h-4" />
                      <span className="text-xs">{option.label}</span>
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    Reduzir Animações
                  </label>
                  <p className="text-xs text-gray-500">
                    Desativa animações para reduzir distrações
                  </p>
                </div>
                <Switch
                  checked={tempSettings.reducedMotion}
                  onCheckedChange={checked =>
                    handleSettingChange('reducedMotion', checked)
                  }
                  aria-label="Reduzir animações"
                />
              </div>
            </div>
          </div>

          {/* Navigation Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Navegação
            </h3>

            <div className="space-y-4">
              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    Navegação por Teclado
                  </label>
                  <p className="text-xs text-gray-500">
                    Destaca elementos focáveis com o teclado
                  </p>
                </div>
                <Switch
                  checked={tempSettings.keyboardNavigation}
                  onCheckedChange={checked =>
                    handleSettingChange('keyboardNavigation', checked)
                  }
                  aria-label="Ativar navegação por teclado"
                />
              </div>

              {/* Focus Visible */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    Indicador de Foco
                  </label>
                  <p className="text-xs text-gray-500">
                    Mostra claramente qual elemento está focado
                  </p>
                </div>
                <Switch
                  checked={tempSettings.focusVisible}
                  onCheckedChange={checked =>
                    handleSettingChange('focusVisible', checked)
                  }
                  aria-label="Mostrar indicador de foco"
                />
              </div>
            </div>
          </div>

          {/* Screen Reader Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Leitor de Tela
            </h3>

            <div className="space-y-4">
              {/* Screen Reader Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    Modo Leitor de Tela
                  </label>
                  <p className="text-xs text-gray-500">
                    Otimiza a interface para leitores de tela
                  </p>
                </div>
                <Switch
                  checked={tempSettings.screenReader}
                  onCheckedChange={checked =>
                    handleSettingChange('screenReader', checked)
                  }
                  aria-label="Ativar modo leitor de tela"
                />
              </div>

              {/* Announce Changes */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">
                    Anunciar Mudanças
                  </label>
                  <p className="text-xs text-gray-500">
                    Anuncia mudanças na interface via leitor de tela
                  </p>
                </div>
                <Switch
                  checked={tempSettings.announceChanges}
                  onCheckedChange={checked =>
                    handleSettingChange('announceChanges', checked)
                  }
                  aria-label="Anunciar mudanças"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Ações Rápidas
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  announce('Pulando para o conteúdo principal');
                  // This would be handled by the parent component
                }}
                className="flex items-center gap-2"
              >
                <Mouse className="w-4 h-4" />
                Pular para Conteúdo
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  announce('Testando leitor de tela');
                  // This would trigger a test announcement
                }}
                className="flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Testar Leitor
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Resetar
            </Button>

            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              Cancelar
            </Button>

            <Button onClick={handleSave} className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilitySettings;













