export interface PaginatedResponseDto<T> {
  records: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}