import type React from 'react';
import { forwardRef } from 'react';

/**
 * A form that can only be submitted when using the meta or control key.
 */
export const KeyboundForm = forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
  // @todo fix typescript error
  // eslint-disable-next-line react/prop-types
>(({ onSubmit, onKeyDown, ...rest }, ref) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter') {
      if (event.target instanceof HTMLTextAreaElement && !(event.metaKey || event.ctrlKey)) {
        return;
      }

      event.preventDefault();

      if (event.metaKey || event.ctrlKey) {
        handleSubmit(event);
      }
    }
  };

  return (
    // @todo fix a11y issues
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <form
      {...rest}
      onSubmit={handleSubmit}
      onKeyDown={onKeyDown ?? handleKeyDown}
      ref={ref}
    />
  );
});

KeyboundForm.displayName = 'KeyboundForm';
