import { Container, Heading } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';

import { RequestProductListTable } from './components/request-product-table';

export const RequestProductList = () => {
  const { t } = useTranslation();

  return (
    <Container
      data-testid="request-product-list-container"
      className="divide-y p-0"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <Heading data-testid="request-product-list-heading">
          {t('requests.product-requests')}
        </Heading>
      </div>
      <RequestProductListTable />
    </Container>
  );
};
