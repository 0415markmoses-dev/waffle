import PropTypes from 'prop-types';
import {HEALTH_COLORS} from '../Health/HealthColors.js';
import {useTester} from '../../Hooks/queries/useTestersQuery.js';
import {useFiles} from '../../Hooks/queries/useFilesQuery.js';
import {TesterTagEditor} from '../Testers/TesterTagEditor.jsx';

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

const EXT_ICONS = {
    jpeg: 'lni-gallery',
    jpg: 'lni-gallery',
    png: 'lni-gallery',
    gif: 'lni-gallery',
    pdf: 'lni-file-multiple',
    txt: 'lni-text-format-remove',
    mov: 'lni-play',
    mp4: 'lni-play',
    avi: 'lni-play',
    doc: 'lni-file-pencil',
    docx: 'lni-file-pencil',
    xls: 'lni-bar-chart-4',
    xlsx: 'lni-bar-chart-4',
    csv: 'lni-bar-chart-4',
};

const iconForExt = (ext) => EXT_ICONS[(ext ?? '').toLowerCase()] ?? 'lni-paperclip-1';

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

const COMMENT_MAX_CHARS = 160;

const stripMarkdown = (md) => {
    if (!md) return '';
    return md
        .replace(/```[\s\S]*?```/g, '')          // fenced code blocks
        .replace(/`[^`]+`/g, '')                  // inline code
        .replace(/!\[.*?\]\(.*?\)/g, '')          // images
        .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')   // links → keep label
        .replace(/^#{1,6}\s+/gm, '')              // headings
        .replace(/(\*\*|__)(.*?)\1/g, '$2')      // bold
        .replace(/(\*|_)(.*?)\1/g, '$2')         // italic
        .replace(/^[-*+]\s+/gm, '')              // unordered list markers
        .replace(/^\d+\.\s+/gm, '')              // ordered list markers
        .replace(/^>\s+/gm, '')                  // blockquotes
        .replace(/^[-*_]{3,}\s*$/gm, '')         // horizontal rules
        .replace(/\n{2,}/g, ' ')                 // multiple newlines → space
        .replace(/\n/g, ' ')                     // single newlines → space
        .trim();
};

const truncate = (str, max) => {
    if (!str || str.length <= max) return str;
    return str.slice(0, max).trimEnd() + '…';
};

const iconForKey = (map, value) => {
    if (!value) return null;
    const key = String(value).toLowerCase();
    return Object.entries(map).find(([k]) => key.includes(k))?.[1] ?? null;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const DEFAULT_AVATAR = '/assets/gator_avatar.png';

const Avatar = ({label, src}) => {
    const hasImg = src && src !== DEFAULT_AVATAR;
    return (
        <div className={`acp-avatar${hasImg ? ' acp-avatar--img' : ''}`}>
            {hasImg ? <img src={src} alt={label}/> : <span>{initials(label)}</span>}
        </div>
    );
};

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

    const fileIris = answerData.files ?? [];
    const fileQueries = useFiles(fileIris);
    const resolvedFiles = fileQueries.map((q, i) => ({iri: fileIris[i], ...(q.data ?? {})}));

    return <AnswerCardContent answerData={answerData} tester={tester ?? null} testerId={testerId}
                              resolvedFiles={resolvedFiles}/>;
};

// ── Pure display component ────────────────────────────────────────────────────

const AnswerCardContent = ({answerData, tester, testerId, resolvedFiles = []}) => {
    const {author, state, comment, created, updated, systemInfos} = answerData;

    // Identity: prefer nickname, then email localpart
    const email = tester?.email ?? null;
    const nickname = tester?.nickname ?? null;
    const avatarSrc = tester?.profilePictureUrl ?? null;
    const displayName = nickname ?? (email ? email.split('@')[0] : (author ?? '—'));
    const emailPart = email ?? (author?.includes('@') ? author : null);
    const date = created ?? updated ?? null;

    const browser = systemInfos?.browser ?? null;
    const os = systemInfos?.os ?? null;
    const device = systemInfos?.device ?? null;

    const browserIcon = iconForKey(BROWSER_ICONS, browser);
    const osIcon = iconForKey(OS_ICONS, os);
    const deviceIcon = iconForKey(DEVICE_ICONS, device);

    const MAX_FILES = 3;
    const visibleFiles = resolvedFiles.slice(0, MAX_FILES);
    const extraFiles = resolvedFiles.length - MAX_FILES;

    return (
        <div className="acp-row">

            {/* Author */}
            <div className="acp-col acp-col-author">
                <Avatar label={displayName} src={avatarSrc}/>
                <div className="acp-author-info">
                    <span className="acp-author-name">{displayName}</span>
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
                    {tester?.tags?.length > 0 && (
                        <TesterTagEditor
                            tags={tester.tags}
                            testerId={testerId}
                            editable={false}
                        />
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
                <p className="acp-comment">{truncate(stripMarkdown(comment), COMMENT_MAX_CHARS)}</p>
            </div>

            {/* Files */}
            <div className="acp-col acp-col-files">
                {resolvedFiles.length === 0 ? (
                    <span className="text-muted" style={{fontSize: '.75rem'}}>No attachments</span>
                ) : (
                    <>
                        {visibleFiles.map((f, i) => (
                            <div key={f.iri ?? i} className="acp-file-thumb"
                                 title={f.extension ? `.${f.extension}` : undefined}>
                                <i className={`font-icon lni ${iconForExt(f.extension)}`}/>
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
