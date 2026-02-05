import type { PropsWithChildren } from 'react';

export const VisuallyHidden = ({ children }: PropsWithChildren) => (
  <span className="sr-only">{children}</span>
);
