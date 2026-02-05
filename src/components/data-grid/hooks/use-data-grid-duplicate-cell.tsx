import { useDataGridContext } from '@components/data-grid/context';
import { useWatch } from 'react-hook-form';

interface UseDataGridDuplicateCellOptions {
  duplicateOf: string;
}

export const useDataGridDuplicateCell = ({ duplicateOf }: UseDataGridDuplicateCellOptions) => {
  const { control } = useDataGridContext();

  const watchedValue = useWatch({ control, name: duplicateOf });

  return {
    watchedValue
  };
};
