import type { CommissionLine } from '@custom-types/commission';
import { EllipsisHorizontal, Eye } from '@medusajs/icons';
import { DropdownMenu } from '@medusajs/ui';

type Props = {
  handleDetail: (line: CommissionLine) => void;
  line: CommissionLine;
};

export function ActionMenu({ handleDetail, line }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <EllipsisHorizontal />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          className="gap-x-2"
          onClick={() => {
            handleDetail(line);
          }}
        >
          <Eye className="text-ui-fg-subtle" />
          See details
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}
