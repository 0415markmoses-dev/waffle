import PropTypes from 'prop-types';

/**
 * Builds the list of page tokens to render.
 * Returns an array of numbers (page) or the string '…'.
 */
const buildPages = (current, total) => {
    if (total <= 5) return Array.from({length: total}, (_, i) => i + 1);

    const pages = new Set([1, total, current - 1, current, current + 1].filter(p => p >= 1 && p <= total));
    const sorted = [...pages].sort((a, b) => a - b);

    const result = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
        result.push(sorted[i]);
    }
    return result;
};

export const Pagination = ({page, totalPages, onChange}) => {
    if (totalPages <= 1) return null;

    const tokens = buildPages(page, totalPages);

    return (
        <div className="pagination-bar">
            {/* Prev */}
            <button
                className="pg-btn pg-arrow"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
                aria-label="Previous page"
            >
                <i className="font-icon lni lni-arrow-left"/>
            </button>

            {tokens.map((token, i) =>
                token === '…' ? (
                    <span key={`ellipsis-${i}`} className="pg-ellipsis">…</span>
                ) : (
                    <button
                        key={token}
                        className={`pg-btn pg-num${token === page ? ' pg-active' : ''}`}
                        onClick={() => token !== page && onChange(token)}
                        aria-current={token === page ? 'page' : undefined}
                    >
                        {token}
                    </button>
                )
            )}

            {/* Next */}
            <button
                className="pg-btn pg-arrow"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
                aria-label="Next page"
            >
                <i className="font-icon lni lni-arrow-right"/>
            </button>
        </div>
    );
};

Pagination.propTypes = {
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};
