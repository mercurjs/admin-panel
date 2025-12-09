export interface AdminAddClaimOutboundItemsPayload {
  items: {
    variant_id: string;
    quantity: number;
    reason?: string;
    description?: string;
    internal_note?: string;
  }[];
}

