import { useEffect } from 'react';

const DEFAULT_TITLE = 'HeroCommu';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export function setDocumentTitle(title: string) {
  document.title = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE;
}
