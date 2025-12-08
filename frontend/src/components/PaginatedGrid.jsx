import React, { useState, useEffect } from "react";

const PaginatedGrid = ({
  data = [],
  CardComponent,
  cardProps = {},
  onPageChange,       // callback to notify HomePage
  pageSize = 12, 
  hasMore = false,     
}) => {

  const [currentPage, setCurrentPage] = useState(1);

  let totalPages = Math.ceil(data.length / pageSize);

  // If backend says more data exists, show one extra "virtual" page
  if (hasMore) {
    totalPages += 1;
  }

  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 whenever filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Auto scroll to top when switching pages
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Handle pagination clicks and notify parent
  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    if (onPageChange) onPageChange(pageNum); // lazy load next batch when needed
  };

  if (!data.length) {
    return <p className="text-center mt-10">No prompts found</p>;
  }

  // PAGINATION BUTTON WINDOW (4 page numbers)
  const windowSize = 4;
  let startPage = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let endPage = startPage + windowSize - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  return (
    <div>
      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
        {currentData.map((item) => (
          <CardComponent key={item.id} prompt={item} {...cardProps} />
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">

          {/* Prev */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 cursor-pointer border rounded-md disabled:opacity-40"
          >
            Prev
          </button>

          {/* Page Numbers */}
          {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
            const page = startPage + i;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === page
                    ? "bg-teal-500 text-white"
                    : "bg-white cursor-pointer"
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
            className="px-4 py-2 border cursor-pointer rounded-md disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}
    </div>
  );
};

export default PaginatedGrid;
