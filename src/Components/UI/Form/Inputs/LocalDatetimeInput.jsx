import PropTypes from "prop-types";

export const LocalDatetimeInput = ({
                                       value,
                                       onChange = () => {
                                       },
                                       ...props
                                   }) => {
    // Convert UTC string to Date object
    const utcDate = new Date(value);

    // Convert to local datetime string in the format "YYYY-MM-DDTHH:MM"
    const toLocalDatetimeString = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const localValue = value ? toLocalDatetimeString(utcDate) : '';

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
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
};
