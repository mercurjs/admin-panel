import type { ComponentType, ReactNode } from 'react';

export interface WidgetProps {
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  before: ComponentType<any>[];
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  after: ComponentType<any>[];
}

export interface PageProps<TData> {
  children: ReactNode;
  widgets: WidgetProps;
  data?: TData;
  showJSON?: boolean;
  showMetadata?: boolean;
  hasOutlet?: boolean;
}
