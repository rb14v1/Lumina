import React, { useState, useEffect } from "react";

const PaginatedGrid = ({
  data = [],
  CardComponent,
  cardProps = {},
  pageSize = 12,
  onPageChange,         // HomePage uses this to lazy-load data
}) => {

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  // Slice current page data
  const start = (currentPage - 1) * pageSize;
  const currentData = data.slice(start, start + pageSize);

  // When data changes significantly (like loading next 12), stay on same page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [data]);

  const handleChangePage = async (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    // Tell HomePage we need next batch for lazy-loading
    if (onPageChange) {
      await onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col">

      {/* GRID with fixed height to prevent jumping */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        style={{ minHeight: "600px" }} 
      >
        {currentData.map((item) => (
          <CardComponent key={item.id} prompt={item} {...cardProps} />
        ))}
      </div>

      {/* PAGINATION ALWAYS FIXED AT BOTTOM */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-6">

          {/* Prev */}
          <button
            onClick={() => handleChangePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-40"
          >
            Prev
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handleChangePage(page)}
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
            onClick={() => handleChangePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-40"
          >
            Next
          </button>

        </div>
      )}
    </div>
  );
};

export default PaginatedGrid;
