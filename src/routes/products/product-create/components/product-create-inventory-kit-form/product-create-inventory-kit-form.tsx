import { ProductCreateInventoryKitSection } from '@routes/products/product-create/components/product-create-inventory-kit-form/components/product-create-inventory-kit-section';
import type { ProductCreateSchemaType } from '@routes/products/product-create/types';
import type { UseFormReturn } from 'react-hook-form';

type ProductAttributesProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
};

export const ProductCreateInventoryKitForm = ({ form }: ProductAttributesProps) => (
  <div
    className="flex flex-col items-center p-16"
    data-testid="product-create-inventory-kit-form"
  >
    <div
      className="flex w-full max-w-[720px] flex-col gap-y-8"
      data-testid="product-create-inventory-kit-form-content"
    >
      <ProductCreateInventoryKitSection form={form} />
    </div>
  </div>
);
