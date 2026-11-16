import { useState, useRef } from 'react';

export interface UseFileDropOptions {
  onFileDrop: (file: File) => void;
}

/**
 * Función pura que determina si los tipos de un evento de arrastre
 * corresponden a archivos del sistema de archivos ('Files') y no a texto o elementos internos.
 */
export function isFilesDragEvent(types: readonly string[] | DOMStringList | undefined): boolean {
  if (!types) return false;
  if (Array.isArray(types)) {
    return types.includes('Files');
  }
  if (typeof (types as DOMStringList).contains === 'function') {
    return (types as DOMStringList).contains('Files');
  }
  // En caso de colecciones tipo array-like
  return Array.from(types).includes('Files');
}

/**
 * Hook para gestionar el arrastre y soltado (drag-and-drop) de archivos del sistema
 * (JSON o imágenes PNG editables) sobre la ventana del navegador.
 *
 * Utiliza un contador de profundidad de nodos para evitar el parpadeo
 * que ocurre cuando el cursor sobrevuela elementos secundarios del DOM.
 */
export function useFileDrop({ onFileDrop }: UseFileDropOptions) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    if (isFilesDragEvent(e.dataTransfer?.types)) {
      e.preventDefault();
      dragCounter.current++;
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isFilesDragEvent(e.dataTransfer?.types)) {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setIsDraggingFile(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isFilesDragEvent(e.dataTransfer?.types)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isFilesDragEvent(e.dataTransfer?.types)) {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDraggingFile(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        onFileDrop(file);
      }
    }
  };

  return {
    isDraggingFile,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
}
