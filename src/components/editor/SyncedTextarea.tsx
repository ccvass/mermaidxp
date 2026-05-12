import React, { useEffect, useRef, useState } from 'react';

interface SyncedTextareaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  spellCheck?: boolean;
}

export const SyncedTextarea: React.FC<SyncedTextareaProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  className,
  placeholder,
  disabled,
  spellCheck,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  // Update internal value when the prop changes (including undo/redo)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    onChange(e);
  };

  return (
    <textarea
      ref={textareaRef}
      value={internalValue}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      spellCheck={spellCheck}
    />
  );
};
