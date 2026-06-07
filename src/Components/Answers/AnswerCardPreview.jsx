import PropTypes from 'prop-types';
import {HEALTH_COLORS} from '../Health/HealthDisplay.jsx';
import {useTester} from '../../Hooks/queries/useTestersQuery.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATE_LABELS = {
    pass: 'Passed',
    pass_with_bugs: 'Passed with bugs',
    failed: 'Failed',
    blocked: 'Blocked',
    pending: 'Pending',
};

const STATE_ICONS = {
    pass: 'lni-check-circle-1',
    pass_with_bugs: 'lni-check-circle-1',
    failed: 'lni-xmark-circle',
    blocked: 'lni-locked-1',
    pending: 'lni-hourglass',
};

const BROWSER_ICONS = {
    chrome: 'lni-chrome',
    firefox: 'lni-firefox',
    safari: 'lni-safari',
    edge: 'lni-microsoft-edge',
    opera: 'lni-opera-mini',
};

const OS_ICONS = {
    windows: 'lni-windows',
    macos: 'lni-apple-brand',
    mac: 'lni-apple-brand',
    ubuntu: 'lni-ubuntu',
    linux: 'lni-ubuntu',
    ios: 'lni-ios',
    android: 'lni-android',
};

const DEVICE_ICONS = {
    desktop: 'lni-monitor',
    laptop: 'lni-laptop-2',
    mobile: 'lni-phone',
    tablet: 'lni-laptop-phone',
};

const initials = (str) =>
    (str ?? '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';

const formatDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})
        + ' at '
        + d.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
};

const relativeTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const iconForKey = (map, value) => {
    if (!value) return null;
    const key = String(value).toLowerCase();
    return Object.entries(map).find(([k]) => key.includes(k))?.[1] ?? null;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Avatar = ({label}) => (
    <div className="acp-avatar">
        <span>{initials(label)}</span>
    </div>
);

const StateBadge = ({state}) => {
    const colorKey = state === 'pass_with_bugs' ? 'passWithBugs' : state;
    const color = HEALTH_COLORS[colorKey] ?? HEALTH_COLORS.pending;
    const icon = STATE_ICONS[state] ?? 'lni-hourglass';
    return (
        <span className="acp-badge" style={{color, background: color + '18', border: `1px solid ${color}40`}}>
            <i className={`font-icon lni ${icon}`}/>
            {STATE_LABELS[state] ?? state}
        </span>
    );
};

const SysInfoChip = ({icon, label}) => {
    if (!label) return null;
    return (
        <div className="acp-sys-chip">
            {icon && <i className={`font-icon lni ${icon}`}/>}
            <span>{label}</span>
        </div>
    );
};

// ── Tester-resolving wrapper ──────────────────────────────────────────────────
// Extracts the tester UUID from the IRI, fetches it, and passes resolved data down.

export const AnswerCardPreview = ({answerData}) => {
    const testerIri = typeof answerData.tester === 'string' ? answerData.tester : null;
    const testerId = testerIri ? testerIri.split('/').pop() : undefined;
    const {data: tester} = useTester(testerId);

    return <AnswerCardContent answerData={answerData} tester={tester ?? null}/>;
};

// ── Pure display component ────────────────────────────────────────────────────

const AnswerCardContent = ({answerData, tester}) => {
    const {author, state, comment, created, updated, systemInfos, files = []} = answerData;

    // Identity: prefer tester email, fall back to author string
    const email = tester?.email ?? null;
    const displayName = email ?? author ?? '—';
    // Show localpart of email as the "name" (part before @), full email as subtitle
    const namePart = email ? email.split('@')[0] : displayName;
    const emailPart = email ?? (author?.includes('@') ? author : null);
    const date = created ?? updated ?? null;

    const browser = systemInfos?.browser ?? null;
    const os = systemInfos?.os ?? null;
    const device = systemInfos?.device ?? null;

    const browserIcon = iconForKey(BROWSER_ICONS, browser);
    const osIcon = iconForKey(OS_ICONS, os);
    const deviceIcon = iconForKey(DEVICE_ICONS, device);

    const MAX_FILES = 2;
    const visibleFiles = files.slice(0, MAX_FILES);
    const extraFiles = files.length - MAX_FILES;

    return (
        <div className="acp-row">

            {/* Author */}
            <div className="acp-col acp-col-author">
                <Avatar label={namePart}/>
                <div className="acp-author-info">
                    <span className="acp-author-name">{namePart}</span>
                    {emailPart && (
                        <span className="text-muted" style={{
                            fontSize: '.72rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {emailPart}
                        </span>
                    )}
                </div>
            </div>

            {/* State + date */}
            <div className="acp-col acp-col-state">
                <StateBadge state={state}/>
                <div className="acp-date-wrap">
                    {date ? (
                        <>
                            <span className="acp-date">{formatDate(date)}</span>
                            <span className="acp-rel text-muted">{relativeTime(date)}</span>
                        </>
                    ) : (
                        <span className="text-muted" style={{fontSize: '.75rem'}}>No date</span>
                    )}
                </div>
            </div>

            {/* Comment */}
            <div className="acp-col acp-col-comment">
                <p className="acp-comment">{comment}</p>
            </div>

            {/* Files */}
            <div className="acp-col acp-col-files">
                {files.length === 0 ? (
                    <span className="text-muted" style={{fontSize: '.75rem'}}>No attachments</span>
                ) : (
                    <>
                        {visibleFiles.map((f, i) => (
                            <div key={i} className="acp-file-thumb">
                                <i className="font-icon lni lni-image-1"/>
                            </div>
                        ))}
                        {extraFiles > 0 && (
                            <div className="acp-file-thumb acp-file-extra">+{extraFiles}</div>
                        )}
                    </>
                )}
            </div>

            {/* System info */}
            <div className="acp-col acp-col-sys">
                {(browser || os || device) ? (
                    <>
                        <SysInfoChip icon={browserIcon} label={browser}/>
                        <SysInfoChip icon={osIcon} label={os}/>
                        <SysInfoChip icon={deviceIcon} label={device}/>
                    </>
                ) : (
                    <span className="text-muted" style={{fontSize: '.75rem'}}>No system info</span>
                )}
            </div>

        </div>
    );
};

AnswerCardPreview.propTypes = {
    answerData: PropTypes.shape({
        id: PropTypes.number,
        author: PropTypes.string,
        tester: PropTypes.string,   // IRI string from API
        state: PropTypes.string,
        comment: PropTypes.string,
        created: PropTypes.string,
        updated: PropTypes.string,
        systemInfos: PropTypes.object,
        files: PropTypes.array,
    }).isRequired,
};
