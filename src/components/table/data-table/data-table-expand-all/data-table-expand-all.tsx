import { ArrowsPointingOut, ArrowsReduceDiagonal } from "@medusajs/icons";
import { IconButton, Tooltip } from "@medusajs/ui";

import { useTranslation } from "react-i18next";

type DataTableExpandAllProps = {
  isAllExpanded: boolean;
  onToggleExpandAll: () => void;
};

export const DataTableExpandAll = ({
  isAllExpanded,
  onToggleExpandAll,
}: DataTableExpandAllProps) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      side="bottom"
      content={
        isAllExpanded ? t("general.collapseAll") : t("general.expandAll")
      }
    >
      <IconButton
        size="small"
        onClick={onToggleExpandAll}
        data-testid="data-table-expand-all-button"
      >
        {isAllExpanded ? <ArrowsReduceDiagonal /> : <ArrowsPointingOut />}
      </IconButton>
    </Tooltip>
  );
};
