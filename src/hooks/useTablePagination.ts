import { useEffect, useMemo, useState } from 'react';

export const useTablePagination = <T,>(items: T[], initialPageSize = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  return {
    paginatedData,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    setCurrentPage,
    setPageSize,
  };
};