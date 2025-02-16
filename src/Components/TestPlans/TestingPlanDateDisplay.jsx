import PropTypes from "prop-types";

export const TestingPlanDateDisplay = ({
                                           dueDate = undefined,
                                       }) => {
    if (dueDate === null || dueDate === undefined) return null;

    const date = new Date(dueDate);
    const Month = date.toLocaleString('default', {month: 'short'});
    const Day = date.getDate();
    return <div className="date-calendar-display">
        <div className="date-calendar-display-month">{Month}.</div>
        <div className="date-calendar-display-day text-primary">{Day}</div>
    </div>
}

TestingPlanDateDisplay.propTypes = {
    dueDate: PropTypes.string,
};

export default TestingPlanDateDisplay;
