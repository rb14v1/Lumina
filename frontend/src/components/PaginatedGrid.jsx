import React, { useState, useEffect } from "react";

const PaginatedGrid = ({
  data = [],
  CardComponent,
  cardProps = {}
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const cardsPerPage = 30;
  const totalPages = Math.ceil(data.length / cardsPerPage);

  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentData = data.slice(startIndex, startIndex + cardsPerPage);

  // Reset when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  if (!data.length) {
    return <p className="text-center mt-10">No prompts found</p>;
  }

  // Page window
  const windowSize = 4;
  let startPage = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let endPage = startPage + windowSize - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - windowSize + 1);
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
        {currentData.map((item) => (
          <CardComponent
            key={item.id}
            prompt={item}
            {...cardProps}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10 min-h-[80px]">

          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 cursor-pointer border rounded-md disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: endPage - startPage + 1 }).map((_, i) => {
            const page = startPage + i;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
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

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
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
