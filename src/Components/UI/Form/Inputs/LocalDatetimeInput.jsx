import PropTypes from "prop-types";

export const LocalDatetimeInput = ({
                                       value,
                                       onChange = () => {
                                       },
                                       ...props
                                   }) => {
    const toLocalDatetimeString = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const utcDate = value ? new Date(value) : null;
    const localValue = utcDate && !isNaN(utcDate) ? toLocalDatetimeString(utcDate) : '';

    return (
        <input
            type="datetime-local" className="form-control"
            value={localValue}
            onChange={(e) => {
                // Convert local datetime string back to UTC ISO string
                const localDate = new Date(e.target.value);
                onChange(localDate.toISOString());
            }}
            {...props}
        />
    );
};

LocalDatetimeInput.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
};
