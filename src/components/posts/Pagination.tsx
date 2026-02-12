import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export default function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // 5개 슬롯: 현재 페이지가 중앙(3번째)에 위치
  const slots: (number | null)[] = [];
  for (let offset = -2; offset <= 2; offset++) {
    const p = currentPage + offset;
    slots.push(p >= 1 && p <= totalPages ? p : null);
  }

  const prev5 = Math.max(1, currentPage - 5);
  const next5 = Math.min(totalPages, currentPage + 5);

  const navBtnClass =
    "w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-colors";
  const activeNav =
    "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800";
  const disabledNav = "text-gray-300 dark:text-gray-600 pointer-events-none";

  return (
    <nav className="flex justify-center items-center gap-1 mt-10">
      {/* << 처음으로 */}
      <Link
        href={buildHref(1)}
        className={`${navBtnClass} ${currentPage === 1 ? disabledNav : activeNav}`}
        aria-label="처음 페이지"
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        &laquo;
      </Link>

      {/* < 5페이지 전 */}
      <Link
        href={buildHref(prev5)}
        className={`${navBtnClass} ${currentPage === 1 ? disabledNav : activeNav}`}
        aria-label="5페이지 전"
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        &lsaquo;
      </Link>

      {/* 5개 페이지 슬롯 */}
      {slots.map((page, i) => (
        <span key={i} className={navBtnClass}>
          {page !== null ? (
            <Link
              href={buildHref(page)}
              className={`w-full h-full flex items-center justify-center rounded-lg transition-colors ${
                page === currentPage
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium"
                  : "text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {page}
            </Link>
          ) : null}
        </span>
      ))}

      {/* > 5페이지 후 */}
      <Link
        href={buildHref(next5)}
        className={`${navBtnClass} ${currentPage === totalPages ? disabledNav : activeNav}`}
        aria-label="5페이지 후"
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
      >
        &rsaquo;
      </Link>

      {/* >> 끝으로 */}
      <Link
        href={buildHref(totalPages)}
        className={`${navBtnClass} ${currentPage === totalPages ? disabledNav : activeNav}`}
        aria-label="마지막 페이지"
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
      >
        &raquo;
      </Link>
    </nav>
  );
}
