import { useProduct } from '@hooks/api';
import { XMarkMini } from '@medusajs/icons';
import { IconButton, Text } from '@medusajs/ui';

type TargetItemProps = {
  index: number;
  onRemove: (index: number) => void;
  label: string;
  value: string;
};

export const TargetItem = ({ index, label, onRemove, value }: TargetItemProps) => {
  const { product } = useProduct(value, { fields: 'id,title' }, { enabled: !label });

  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-ui-bg-field-component px-2 py-0.5 shadow-borders-base">
      <Text
        size="small"
        leading="compact"
      >
        {label || product?.title}
      </Text>
      <IconButton
        size="small"
        variant="transparent"
        type="button"
        onClick={() => onRemove(index)}
      >
        <XMarkMini />
      </IconButton>
    </div>
  );
};
