"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers logic
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 4) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-[var(--card)] border border-[var(--border)] rounded-xl mt-4 shadow-sm transition-all hover:shadow-md">
      {/* Items count info */}
      <div className="text-sm text-[var(--muted-foreground)]">
        Hiển thị{" "}
        <span className="font-semibold text-[var(--foreground)]">
          {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        </span>{" "}
        đến{" "}
        <span className="font-semibold text-[var(--foreground)]">
          {Math.min(currentPage * pageSize, totalItems)}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-semibold text-[var(--foreground)]">{totalItems}</span> bản ghi
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-4">
        {/* Page Size Selector (Optional) */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">Số bản ghi:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons List */}
        <div className="flex items-center gap-1.5">
          {/* First Page */}
          <button
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1}
            className="p-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1.5 text-sm text-[var(--muted-foreground)] font-medium"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => handlePageClick(Number(page))}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                    currentPage === page
                      ? "bg-[var(--primary)] text-white shadow-sm font-bold scale-105"
                      : "bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next Page */}
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Trang cuối"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
