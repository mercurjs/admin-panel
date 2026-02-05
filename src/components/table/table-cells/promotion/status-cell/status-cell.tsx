import { StatusCell as StatusCell_ } from '@components/table/table-cells/common/status-cell';
import { getPromotionStatus } from '@lib/promotions';
import type { HttpTypes } from '@medusajs/types';

type PromotionCellProps = {
  promotion: HttpTypes.AdminPromotion;
};

export const StatusCell = ({ promotion }: PromotionCellProps) => {
  const [color, text] = getPromotionStatus(promotion);

  return <StatusCell_ color={color}>{text}</StatusCell_>;
};
