import PropTypes from "prop-types";
import {useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {Doughnut} from "react-chartjs-2";
import {ArcElement, Chart as ChartJS, Tooltip} from "chart.js";

ChartJS.register(ArcElement, Tooltip);

export const HEALTH_COLORS = {
    pass: '#69BC9E',
    passWithBugs: '#a8d5c2',
    failed: '#ef4444',
    blocked: '#f59e0b',
    pending: '#d1d5db',
};

const pct = (value, total) =>
    total === 0 ? 0 : Math.round((value / total) * 100);

const centerHeartPlugin = {
    id: 'centerHeart',
    afterDatasetsDraw(chart) {
        const {ctx, chartArea: {left, top, width, height}} = chart;
        const cx = left + width / 2;
        const cy = top + height / 2;
        ctx.save();
        ctx.font = `bold ${Math.round(width * 0.28)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = chart.config.options.heartColor ?? HEALTH_COLORS.pass;
        ctx.fillText('♥', cx, cy + 3);
        ctx.restore();
    },
};

const dominantColor = (pass, passWithBugs, failed, blocked, pending) => {
    const nonPending = {pass, passWithBugs, failed, blocked};
    const hasNonPending = Object.values(nonPending).some(v => v > 0);
    const pool = hasNonPending ? nonPending : {pending};
    const top = Object.entries(pool).reduce((a, b) => b[1] > a[1] ? b : a, ['pending', -1]);
    return HEALTH_COLORS[top[0]];
};

export const HealthDisplay = ({
                                  pass = 0,
                                  passWithBugs = 0,
                                  failed = 0,
                                  blocked = 0,
                                  pending = 0,
                                  isLoading = false
                              }) => {
    const {t} = useTranslation();
    const chartRef = useRef(null);
    const [hidden, setHidden] = useState({});
    const total = pass + passWithBugs + failed + blocked + pending;

    const toggleSegment = (index) => {
        const chart = chartRef.current;
        if (!chart) return;
        chart.toggleDataVisibility(index);
        chart.update();
        setHidden(prev => ({...prev, [index]: !prev[index]}));
    };

    const legend = [
        {key: 'pass', label: t('Passed'), value: pass},
        {key: 'passWithBugs', label: t('Passed with bugs'), value: passWithBugs},
        {key: 'failed', label: t('Failed'), value: failed},
        {key: 'blocked', label: t('Blocked'), value: blocked},
        {key: 'pending', label: t('Not run'), value: pending},
    ];

    const chartData = {
        datasets: [{
            data: total === 0
                ? [1]
                : [pass, passWithBugs, failed, blocked, pending],
            backgroundColor: total === 0
                ? [HEALTH_COLORS.pending]
                : [HEALTH_COLORS.pass, HEALTH_COLORS.passWithBugs, HEALTH_COLORS.failed, HEALTH_COLORS.blocked, HEALTH_COLORS.pending],
            borderWidth: 0,
            hoverOffset: 4,
        }],
    };

    const chartOptions = {
        cutout: '72%',
        responsive: true,
        animation: {duration: 600},
        layout: {padding: 6},
        heartColor: dominantColor(pass, passWithBugs, failed, blocked, pending),
        plugins: {tooltip: {enabled: total > 0}, legend: {display: false}},
    };

    return (
        <div
            className="plan-health d-flex align-items-center gap-lg"
            style={{opacity: isLoading ? 0.4 : 1, transition: 'opacity 300ms'}}
        >
            <div className="plan-health-donut flex-shrink-0" style={{width: 110, height: 110}}>
                <Doughnut ref={chartRef} data={chartData} options={chartOptions} plugins={[centerHeartPlugin]}/>
            </div>
            <div className="plan-health-legend d-flex flex-column gap-sm">
                {legend.map(({key, label, value}, index) => (
                    <div
                        key={key}
                        className={'plan-health-legend-row d-flex align-items-center gap-sm' + (hidden[index] ? ' opacity-25' : '')}
                        style={{cursor: 'pointer', userSelect: 'none'}}
                        onClick={() => toggleSegment(index)}
                    >
                        <span className="plan-health-dot flex-shrink-0" style={{background: HEALTH_COLORS[key]}}/>
                        <span className="plan-health-label flex-grow-1">{label}</span>
                        <span className="plan-health-count text-end">
                            {value}
                            <span className="plan-health-pct opacity-50 ms-1">({pct(value, total)}%)</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

HealthDisplay.propTypes = {
    pass: PropTypes.number,
    passWithBugs: PropTypes.number,
    failed: PropTypes.number,
    blocked: PropTypes.number,
    pending: PropTypes.number,
    isLoading: PropTypes.bool,
};
