import React, { useState, useCallback, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModalOptions {
  title?: string;
  description?: string;
  content?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({});

  const openModal = useCallback((opts: ModalOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (options.onClose) {
      options.onClose();
    }
  }, [options]);

  const bindTrigger = useCallback((node: ReactNode) => {
    return React.isValidElement(node)
      ? React.cloneElement(node as React.ReactElement, {
          onClick: () => {
            if (node.props.onClick) {
              node.props.onClick();
            }
            openModal(options);
          }
        })
      : node;
  }, [openModal, options]);

  const Modal = useCallback(() => {
    const getWidthClass = () => {
      switch (options.size) {
        case 'sm': return 'sm:max-w-sm';
        case 'md': return 'sm:max-w-md';
        case 'lg': return 'sm:max-w-lg';
        case 'xl': return 'sm:max-w-xl';
        default: return 'sm:max-w-md';
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={getWidthClass()}>
          {options.title && (
            <DialogHeader>
              <DialogTitle>{options.title}</DialogTitle>
              {options.description && (
                <DialogDescription>{options.description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {options.content}
          {(options.footer || options.showCloseButton) && (
            <DialogFooter>
              {options.footer}
              {options.showCloseButton && (
                <Button variant="outline" onClick={closeModal}>
                  Chiudi
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }, [isOpen, options, closeModal]);

  return {
    isOpen,
    openModal,
    closeModal,
    bindTrigger,
    Modal
  };
}