import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface AutoResizeTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange?: (value: string) => void;
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ value, onChange, placeholder, className = '', rows = 1, id, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => internalRef.current!);

    const adjustHeight = () => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);

    useEffect(() => {
      window.addEventListener('resize', adjustHeight);
      return () => window.removeEventListener('resize', adjustHeight);
    }, []);

    return (
      <textarea
        ref={internalRef}
        id={id}
        rows={rows}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`auto-textarea ${className}`}
        {...props}
      />
    );
  }
);

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
