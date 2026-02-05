import type { HttpTypes } from '@medusajs/types';

import type { TaxRateRuleTarget } from './schemas';

export const createTaxRulePayload = (
  target: TaxRateRuleTarget
): HttpTypes.AdminCreateTaxRate['rules'] =>
  target.references.map(reference => ({
    reference: target.reference_type,
    reference_id: reference.value
  }));
