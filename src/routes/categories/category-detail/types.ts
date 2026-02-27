export type CategoryDetail = {
  id: string;
  media: Media[];
  thumbnail_id: string | null;
  icon_id: string | null;
  banner_id: string | null;
};

export type Media = {
  id: string;
  url: string;
  alt_text: string | null;
  created_at?: Date;
  updated_at?: Date;
};
