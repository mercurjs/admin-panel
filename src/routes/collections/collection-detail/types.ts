export type CollectionDetail = {
  id: string
  media: Media[]
  thumbnail_id: string | null
  icon_id: string | null
  banner_id: string | null
  rank: number
}

export type Media = {
  id: string
  url: string
  alt_text: string | null
  created_at?: Date
  updated_at?: Date
}
