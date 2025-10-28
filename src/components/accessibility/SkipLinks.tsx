import React from 'react';
import { Button } from '../ui/button';
import { useAccessibility } from '../../hooks/useAccessibility';

const SkipLinks: React.FC = () => {
  const { skipToContent, focusElement, announce } = useAccessibility();

  const handleSkipToMain = () => {
    skipToContent();
  };

  const handleSkipToNavigation = () => {
    focusElement('nav, [role="navigation"]');
  };

  const handleSkipToSearch = () => {
    focusElement('input[type="search"], [role="search"] input');
  };

  const handleSkipToFilters = () => {
    focusElement('[data-testid="filters"], .filter-panel');
  };

  const handleSkipToContent = () => {
    focusElement('main, [role="main"]');
  };

  return (
    <div className="skip-links sr-only focus-within:not-sr-only">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipToMain}
        className="skip-link"
        aria-label="Pular para o conteúdo principal"
      >
        Pular para Conteúdo Principal
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipToNavigation}
        className="skip-link"
        aria-label="Pular para navegação"
      >
        Pular para Navegação
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipToSearch}
        className="skip-link"
        aria-label="Pular para busca"
      >
        Pular para Busca
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipToFilters}
        className="skip-link"
        aria-label="Pular para filtros"
      >
        Pular para Filtros
      </Button>
    </div>
  );
};

export default SkipLinks;













