import React, { useState, useEffect } from "react";
 
const PaginatedGrid = ({
  data = [],
  CardComponent,
  cardProps = {}   
}) => {
  const [currentPage, setCurrentPage] = useState(1);
 
  const cardsPerPage = 6;
  const totalPages = Math.ceil(data.length / cardsPerPage);
 
  const startIndex = (currentPage - 1) * cardsPerPage;
  const currentData = data.slice(startIndex, startIndex + cardsPerPage);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);
 
  useEffect(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
}, [currentPage]);
 
  if (!data.length) {
    return <p className="text-center mt-10">No prompts found</p>;
  }
 
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
        {currentData.map((item) => (
          <CardComponent
            key={item.id}
            prompt={item}     
            {...cardProps}      
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
 
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 cursor-pointer border rounded-md disabled:opacity-40"
          >
            Prev
          </button>
 
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 border rounded-md ${
                currentPage === i + 1
                  ? "bg-teal-500 text-white"
                  : "bg-white cursor-pointer"
              }`}
            >
              {i + 1}
            </button>
          ))}
 
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
 
 