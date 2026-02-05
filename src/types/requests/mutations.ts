export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'draft';

export type CreateRequestDTO = {
  type: string;
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  submitter_id: string;
  reviewer_id?: string;
  reviewer_note?: string;
  status?: RequestStatus;
};

export type UpdateRequestDTO = {
  id: string;
  reviewer_id?: string;
  reviewer_note?: string;
  status: RequestStatus;
};

export type UpdateRequestDataDTO = {
  id: string;
  type: string;
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type AcceptRequestDTO = {
  id: string;
  reviewer_id: string;
  reviewer_note: string;
  // @todo fix any type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  status: RequestStatus;
};
