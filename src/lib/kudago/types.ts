export type KudagoPlace = {
  id?: number;
  title?: string;
  address?: string;
  coords?: { lat?: number; lon?: number };
};

export type KudagoDateSlot = {
  start?: number;
  end?: number;
};

export type KudagoImage = {
  image?: string;
};

export type KudagoEventRaw = {
  id: number;
  title?: string;
  description?: string;
  body_text?: string;
  place?: KudagoPlace | null;
  dates?: KudagoDateSlot[];
  price?: string;
  age_restriction?: number | string;
  site_url?: string;
  images?: (KudagoImage | string)[];
  favorites_count?: number;
  comments_count?: number;
  categories?: string[];
};

export type KudagoEventsResponse = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: KudagoEventRaw[];
};

export type KudagoEventCategoryRaw = {
  id: number;
  slug: string;
  name: string;
};
