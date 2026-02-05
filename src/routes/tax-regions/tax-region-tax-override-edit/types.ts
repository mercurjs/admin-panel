import type { TaxRateRuleReferenceType } from '@routes/tax-regions/common/constants.ts';
import type { TaxRateRuleReference } from '@routes/tax-regions/common/schemas.ts';

export type InitialRuleValues = {
  [TaxRateRuleReferenceType.PRODUCT]: TaxRateRuleReference[];
  // [TaxRateRuleReferenceType.PRODUCT_COLLECTION]: TaxRateRuleReference[]
  // [TaxRateRuleReferenceType.PRODUCT_TAG]: TaxRateRuleReference[]
  [TaxRateRuleReferenceType.SHIPPING_OPTION]: TaxRateRuleReference[];
  [TaxRateRuleReferenceType.PRODUCT_TYPE]: TaxRateRuleReference[];
  // [TaxRateRuleReferenceType.CUSTOMER_GROUP]: TaxRateRuleReference[]
};
