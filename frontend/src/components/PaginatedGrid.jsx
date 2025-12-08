import React, { useState, useEffect } from "react";

const PaginatedGrid = ({
  data = [],
  CardComponent,
  cardProps = {},
  onPageChange,
  pageSize = 12,
  hasMore = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // TOTAL pages based on what we CURRENTLY HAVE in memory
  let totalPages = Math.ceil(data.length / pageSize);

  // If backend still has more, show one virtual page
  if (hasMore) totalPages += 1;

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  // RESET only if data size changes significantly (filters, tabs)
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Scroll-top when user switches pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    if (onPageChange) onPageChange(pageNum);
  };

  if (!data.length) {
    return <p className="text-center mt-10">No prompts found</p>;
  }

  /** Pagination window */
  const windowSize = 4;
  let startPage = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let endPage = startPage + windowSize - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  return (
    <div className="flex flex-col">

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
        {currentData.map((item) => (
          <CardComponent key={item.id} prompt={item} {...cardProps} />
        ))}
      </div>

      {/* PAGINATION (fixed height so layout NEVER jumps) */}
      <div className="min-h-[80px] flex justify-center items-center mt-10">
        {totalPages > 1 && (
          <div className="flex items-center gap-2">

            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-40"
            >
              Prev
            </button>

            {/* Numbered pages */}
            {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
              const page = startPage + i;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 border rounded-md ${
                    currentPage === page
                      ? "bg-teal-500 text-white"
                      : "bg-white"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-40"
            >
              Next
            </button>

          </div>
        )}
      </div>

    </div>
  );
};

export default PaginatedGrid;
