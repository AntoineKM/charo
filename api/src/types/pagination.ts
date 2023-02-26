export type Paginate<T> = {
  data: T[];
  metadata: Metadata;
};

export type Metadata = {
  limit: number;
  page: number;
  page_count: number;
  length: number;
};
