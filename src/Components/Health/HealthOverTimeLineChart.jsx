import PropTypes from 'prop-types';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Line} from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import {HEALTH_COLORS} from './HealthDisplay.jsx';
import {ErrorState} from '../UI/ErrorState.jsx';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Filler, Tooltip);

// ── Last-point callout plugin ─────────────────────────────────────────────────
const lastPointPlugin = {
    id: 'lastPoint',
    afterDraw(chart) {
        const metas = chart.config.options._visibleDatasets ?? [];
        metas.forEach(({metaIndex}) => {
            const ds = chart.getDatasetMeta(metaIndex);
            const pts = ds.data.filter(p => p && !p.skip && p.y != null);
            if (!pts.length) return;

            const last = pts[pts.length - 1];
            const {ctx} = chart;
            const x = last.x;
            const y = last.y;
            const color = chart.data.datasets[metaIndex].borderColor;

            // glow + dot
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = color + '33';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
            ctx.restore();

        });
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATES = ['pass', 'pass_with_bugs', 'failed', 'blocked', 'pending'];

const STATE_COLORS = {
    pass: HEALTH_COLORS.pass,
    pass_with_bugs: HEALTH_COLORS.passWithBugs,
    failed: HEALTH_COLORS.failed,
    blocked: HEALTH_COLORS.blocked,
    pending: HEALTH_COLORS.pending,
};

const STATE_LABELS = {
    pass: 'Passed',
    pass_with_bugs: 'Passed with bugs',
    failed: 'Failed',
    blocked: 'Blocked',
    pending: 'Not run',
};

const GROUP_OPTIONS = ['day', 'week', 'month', 'year'];

const bucketKey = (date, groupBy) => {
    const d = new Date(date);
    if (groupBy === 'day') return d.toISOString().slice(0, 10);
    if (groupBy === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(d.setDate(diff));
        return mon.toISOString().slice(0, 10);
    }
    if (groupBy === 'month') return d.toISOString().slice(0, 7);
    if (groupBy === 'year') return String(d.getFullYear());
    return d.toISOString().slice(0, 10);
};

const formatBucketLabel = (key, groupBy) => {
    if (groupBy === 'year') return key;
    if (groupBy === 'month') {
        const [y, m] = key.split('-');
        return new Date(y, m - 1).toLocaleDateString(undefined, {month: 'short', year: 'numeric'});
    }
    const d = new Date(key);
    return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
};

// ── Component ─────────────────────────────────────────────────────────────────

export const HealthOverTimeLineChart = ({
                                            title,
                                            answersStatItems = [],
                                        }) => {
    const {t} = useTranslation();
    const resolvedTitle = title ?? t('Health over time');
    const chartRef = useRef(null);
    const [groupBy, setGroupBy] = useState('day');

    useEffect(() => {
        return () => {
            chartRef.current?.destroy();
        };
    }, []);

    const {labels, datasets, visibleDatasets} = useMemo(() => {
        if (!answersStatItems.length) return {labels: [], datasets: [], visibleDatasets: []};

        // Which states actually appear in the data
        const presentStates = STATES.filter(s => answersStatItems.some(a => a.state === s));

        // Sort items by date, bucket them
        const sorted = [...answersStatItems].sort((a, b) => new Date(a.date) - new Date(b.date));

        const bucketMap = {};
        sorted.forEach(item => {
            const key = bucketKey(item.date, groupBy);
            if (!bucketMap[key]) bucketMap[key] = {};
            bucketMap[key][item.state] = (bucketMap[key][item.state] ?? 0) + 1;
        });

        const bucketKeys = Object.keys(bucketMap).sort();
        const lbls = bucketKeys.map(k => formatBucketLabel(k, groupBy));

        const dsets = presentStates.map(state => ({
            label: STATE_LABELS[state],
            data: bucketKeys.map(k => bucketMap[k][state] ?? 0),
            borderColor: STATE_COLORS[state],
            backgroundColor: STATE_COLORS[state] + '18',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
            _state: state,
        }));

        // Build callout info for the last point of each dataset
        const vis = dsets.map((ds, i) => {
            const last = ds.data[ds.data.length - 1] ?? null;
            const lbl = lbls[lbls.length - 1] ?? '';
            return {metaIndex: i, label: lbl, pct: last};
        });

        return {labels: lbls, datasets: dsets, visibleDatasets: vis};
    }, [answersStatItems, groupBy]);

    if (!answersStatItems.length) return (
        <div className="w-100">
            <span className="heading small fw-semibold">{resolvedTitle}</span>
            <ErrorState message={t('Not enough data to display this chart.')} size="sm"/>
        </div>
    );

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {duration: 400},
        layout: {padding: {top: 8, right: 8, bottom: 0, left: 0}},
        _visibleDatasets: visibleDatasets,
        interaction: {mode: 'index', intersect: false},
        scales: {
            y: {
                min: 0,
                ticks: {
                    stepSize: 5,
                    color: '#9ca3af',
                    font: {size: 11},
                },
                grid: {color: 'rgba(0,0,0,0.05)', drawTicks: false},
                border: {display: false},
            },
            x: {
                ticks: {
                    color: '#9ca3af',
                    font: {size: 11},
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6,
                },
                grid: {display: false},
                border: {display: false},
            },
        },
        plugins: {
            legend: {display: false},
            tooltip: {
                callbacks: {
                    label: ctx => ' ' + ctx.dataset.label + ': ' + ctx.parsed.y,
                },
            },
        },
    };

    return (
        <div className="health-over-time-chart-wrapper w-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="heading small fw-semibold">{resolvedTitle}</span>
                <select
                    className="form-select form-select-sm w-auto"
                    value={groupBy}
                    onChange={e => setGroupBy(e.target.value)}
                >
                    {GROUP_OPTIONS.map(o => (
                        <option key={o} value={o}>
                            {o.charAt(0).toUpperCase() + o.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{height: 140}}>
                <Line
                    ref={chartRef}
                    data={{labels, datasets}}
                    options={options}
                    plugins={[lastPointPlugin]}
                />
            </div>
        </div>
    );
};

HealthOverTimeLineChart.propTypes = {
    title: PropTypes.string,
    answersStatItems: PropTypes.arrayOf(PropTypes.shape({
        answerId: PropTypes.number,
        date: PropTypes.string,
        state: PropTypes.string,
    })),
};
