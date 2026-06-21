import PropTypes from 'prop-types';

export const EvolutionLine = ({start, targetFinish, current, isOverdue}) => {
    const startDate = new Date(start);
    const endDate = new Date(targetFinish);
    const currentDate = current ? new Date(current) : new Date();

    // When overdue: range is start→now, flag sits at where dueDate was
    // When in time: range is start→dueDate, flag at the end
    const rangeEnd = isOverdue ? currentDate : endDate;
    const totalMs = rangeEnd - startDate;
    const elapsedMs = currentDate - startDate;

    const fillPct = totalMs > 0
        ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)))
        : 0;

    // Position of the due date within the extended (start→now) range
    const flagPct = isOverdue && totalMs > 0
        ? Math.min(100, Math.max(0, Math.round(((endDate - startDate) / totalMs) * 100)))
        : null;

    return (
        <div className="ctpd-bar-wrap">
            <div className="ctpd-bar-outer">
                {/* Flag above bar at due-date position when overdue */}
                {isOverdue && flagPct !== null && (
                    <div className="ctpd-bar-flag-inline" style={{left: `${flagPct}%`}}>
                        🏁
                    </div>
                )}

                <div className="ctpd-bar-track">
                    <div
                        className={`ctpd-bar-fill ${isOverdue ? 'ctpd-bar-fill--overdue' : ''}`}
                        style={{width: `${fillPct}%`}}
                    >
                        <span className="ctpd-bar-dot"/>
                    </div>
                </div>
            </div>

            {/* Flag at the end when not overdue */}
            {!isOverdue && <span className="ctpd-bar-flag">🏁</span>}
        </div>
    );
};

EvolutionLine.propTypes = {
    start: PropTypes.string.isRequired,
    targetFinish: PropTypes.string.isRequired,
    current: PropTypes.instanceOf(Date),
    isOverdue: PropTypes.bool,
};
