import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // 페이지가 5개 이하면 모든 페이지 표시, 그 이상이면 현재 페이지 주변만 표시
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pageNumbers = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push("...");
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {pageNumbers.map((pageNum, index) =>
        pageNum === "..." ? (
          <span key={index} className="pagination-ellipsis">
            ...
          </span>
        ) : (
          <button
            key={pageNum}
            className={`pagination-btn ${
              currentPage === pageNum ? "active" : ""
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        )
      )}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;

