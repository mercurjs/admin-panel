import { useEffect, useRef, type RefObject } from 'react';

import { DataGridQueryTool } from '@components/data-grid/models';

export const useDataGridQueryTool = (containerRef: RefObject<HTMLElement>) => {
  const queryToolRef = useRef<DataGridQueryTool | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      queryToolRef.current = new DataGridQueryTool(containerRef.current);
    }
  }, [containerRef]);

  return queryToolRef.current;
};
