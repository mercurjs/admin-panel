import { ProductRequestDetail } from '@routes/requests/request-product-details/components/product-detail';
import { useParams } from 'react-router-dom';

export const RequestProductDetails = () => {
  const { id } = useParams();

  return <ProductRequestDetail id={id!} />;
};
