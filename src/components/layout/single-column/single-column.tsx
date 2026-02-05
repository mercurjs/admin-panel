import type { ReactNode } from 'react';

export type SingleColumnLayoutProps = {
  children: ReactNode;
};

export const SingleColumnLayout = ({ children }: SingleColumnLayoutProps) => (
  <div className="flex flex-col gap-y-3">{children}</div>
);
