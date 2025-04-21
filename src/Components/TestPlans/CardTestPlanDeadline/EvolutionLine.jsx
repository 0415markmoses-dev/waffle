import {useEffect, useState} from "react";

export const EvolutionLine = ({start, targetFinish, current}) => {
    const [startDate, setStartDate] = useState(new Date(start));
    const [targetFinishDate, setTargetFinishDate] = useState(new Date(targetFinish));
    const [currentDate, setCurrentDate] = useState(current ? new Date(current) : null);

    useEffect(() => {
        setStartDate(new Date(start));
        setTargetFinishDate(new Date(targetFinish));
        setCurrentDate(current ? new Date(current) : null);
    }, [start, targetFinish, current]);

    const mostFarthestDate = currentDate && currentDate > targetFinishDate ? currentDate : targetFinishDate;
    const totalDuration = mostFarthestDate - startDate;

    const getPercentage = (date) => {
        if (!date || !totalDuration) return 0;
        return ((date - startDate) / totalDuration) * 100;
    };

    const currentPos = getPercentage(currentDate);
    const targetPos = getPercentage(targetFinishDate);

    const showOverrun = currentDate && currentDate > targetFinishDate;

    return (
        <div className="container-fluid py-2">


            {/* Labels */}
            <div className="position-relative mb-1" style={{height: '1.2rem'}}>
                <div className="position-absolute start-0 translate-middle-x">
                    <small>
                        🌱
                    </small>
                </div>
                <div
                    className="position-absolute translate-middle-x"
                    style={{left: `${currentPos}%`}}
                >
                    <small>
                        📍
                    </small>
                </div>
                <div
                    className="position-absolute translate-middle-x"
                    style={{left: `${targetPos}%`}}
                >
                    <small>
                        🏁
                    </small>
                </div>
            </div>
            {/* Progress Bar Container */}
            <div className="progress-custom-bar position-relative">
                {/* Green bar: Start → Current */}
                {currentDate && (
                    <div
                        className="position-absolute bg-primary h-100"
                        style={{
                            left: `0%`,
                            width: `${currentPos}%`,
                        }}
                    ></div>
                )}

                {/* Gray bar: Current → Target (if current < target) */}
                {currentDate && currentDate < targetFinishDate && (
                    <div
                        className="position-absolute bg-transparent h-100"
                        style={{
                            left: `${currentPos}%`,
                            width: `${targetPos - currentPos}%`,
                        }}
                    ></div>
                )}

                {/* Red bar: Overrun (if current > target) */}
                {showOverrun && (
                    <div
                        className="position-absolute bg-danger h-100"
                        style={{
                            left: `${targetPos}%`,
                            width: `${currentPos - targetPos}%`,
                        }}
                    ></div>
                )}
            </div>
        </div>
    );
};
