import { SingleColumnPage } from '@components/layout/pages';
import { useExtension } from '@providers/extension-provider';
import { PriceListListTable } from '@routes/price-lists/price-list-list/components/price-list-list-table';

export const PriceListList = () => {
  const { getWidgets } = useExtension();

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets('price_list.list.after'),
        before: getWidgets('price_list.list.before')
      }}
    >
      <PriceListListTable />
    </SingleColumnPage>
  );
};
