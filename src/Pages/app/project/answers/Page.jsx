import {useNavigate, useParams} from 'react-router';
import {useTranslation} from 'react-i18next';
import {useRef, useState} from 'react';
import Modal from 'react-modal';
import {useAnswer, useAnswers, useUpdateAnswer} from '../../../../Hooks/queries/useAnswersQuery.js';
import {useFiles} from '../../../../Hooks/queries/useFilesQuery.js';
import FilesService from '../../../../Services/PrivateApi/FilesService.js';
import AttachmentItem, {IMAGE_EXTS, VIDEO_EXTS} from '../../../../Components/UI/Uploader/AttachmentItem.jsx';
import ImageLightbox from '../../../../Components/UI/Lightbox/ImageLightbox.jsx';
import VideoLightbox from '../../../../Components/UI/Lightbox/VideoLightbox.jsx';

Modal.setAppElement('#root');
import {useQuestion} from '../../../../Hooks/queries/useQuestionsQuery.js';
import {useTestPlan} from '../../../../Hooks/queries/useTestPlansQuery.js';
import {useRelease} from '../../../../Hooks/queries/useReleasesQuery.js';
import {useTester} from '../../../../Hooks/queries/useTestersQuery.js';
import {useProjectStore} from '../../../../Store/PrivateData/ProjectsStore.js';
import {PageContentWrapper} from '../../../../Components/Navigation/PageContentWrapper.jsx';
import {PageTitle} from '../../../../Components/Navigation/PageTitle.jsx';
import {PageElementWrapper} from '../../../../Components/Navigation/PageElementWrapper.jsx';
import {Row} from '../../../../Components/UI/Grid/Row.jsx';
import {Col} from '../../../../Components/UI/Grid/Col.jsx';
import {Card} from '../../../../Components/UI/Card/Card.jsx';
import {CardBody} from '../../../../Components/UI/Card/CardBody.jsx';
import {CardHeader} from '../../../../Components/UI/Card/CardHeader.jsx';
import {Button} from '../../../../Components/UI/Buttons/Button.jsx';
import {CardGroup} from '../../../../Components/UI/Card/CardGroup.jsx';
import {ReleaseDescription} from '../../../../Components/Releases/ReleaseDescription.jsx';
import {HEALTH_COLORS} from '../../../../Components/Health/HealthDisplay.jsx';

// ── System info icon map ──────────────────────────────────────────────────────

/** Returns a lni-* class for known system info keys, null otherwise. */
const iconForKey = (key, value = '') => {
    const k = key.toLowerCase().replace(/[_\s-]/g, '');
    const v = String(value).toLowerCase();

    if (k === 'browser') {
        if (v.includes('safari')) return 'lni-safari';
        if (v.includes('chrome')) return 'lni-chrome';
        if (v.includes('firefox')) return 'lni-firefox';
        if (v.includes('edge')) return 'lni-microsoft-edge';
        return 'lni-globe-1';
    }
    if (k === 'os' || k === 'operatingsystem') {
        if (v.includes('ios') || v.includes('mac')) return 'lni-apple-brand';
        if (v.includes('android')) return 'lni-android';
        if (v.includes('windows')) return 'lni-windows';
        return 'lni-monitor';
    }
    if (k === 'device') {
        if (v.includes('tab') || v.includes('ipad')) return 'lni-laptop-2';
        return 'lni-phone';
    }
    if (k === 'screen') return 'lni-monitor';
    if (k === 'locale' || k === 'lang' || k === 'language') return 'lni-globe-1';
    return null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATE_LABELS = {
    pass: 'Passed',
    pass_with_bugs: 'Passed with bugs',
    failed: 'Failed',
    blocked: 'Blocked',
    pending: 'Pending',
};

const STATE_DESCRIPTIONS = {
    pass: 'The tester confirmed this scenario works as expected.',
    pass_with_bugs: 'The scenario works but minor issues were noted during testing.',
    failed: 'The tester encountered a critical failure preventing completion.',
    blocked: 'The tester could not proceed — an external blocker prevented testing.',
    pending: 'No response has been submitted for this scenario yet.',
};

const STATE_ICONS = {
    pass: 'lni-check-circle-1',
    pass_with_bugs: 'lni-check-circle-1',
    failed: 'lni-xmark-circle',
    blocked: 'lni-locked-1',
    pending: 'lni-hourglass',
};

const colorKey = (state) => state === 'pass_with_bugs' ? 'passWithBugs' : state;

const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})
        + ' at '
        + d.toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'});
};

const relativeTime = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const initials = (str) =>
    (str ?? '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';

const CONFIRM_MODAL_STYLES = {
    content: {
        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
        marginRight: '-50%', transform: 'translate(-50%, -50%)',
        minWidth: '360px', maxWidth: '480px',
    },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StateBadge = ({state}) => {
    const color = HEALTH_COLORS[colorKey(state)] ?? HEALTH_COLORS.pending;
    const icon = STATE_ICONS[state] ?? 'lni-hourglass';
    return (
        <span className="ap-state-badge" style={{color, background: color + '18', border: `1px solid ${color}40`}}>
            <i className={`font-icon lni ${icon}`}/>
            {STATE_LABELS[state] ?? state}
        </span>
    );
};

const ContextRow = ({label, value}) => (
    <div className="ap-context-row">
        <span className="ap-context-label">{label}</span>
        <span className="ap-context-value">{value ?? '—'}</span>
    </div>
);

const STATE_OPTIONS = ['pass', 'pass_with_bugs', 'failed', 'blocked', 'pending'];

const StateDropdown = ({currentState, onSelect, loading}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click
    const handleBlur = (e) => {
        if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
    };

    return (
        <div className="ap-state-dropdown" ref={ref} onBlur={handleBlur} tabIndex={-1}>
            <Button iconOnly type="light" size="sm" onClick={() => setOpen(o => !o)} disabled={loading}>
                <i className="font-icon lni lni-refresh-circle-1-clockwise"/>
            </Button>
            {open && (
                <div className="ap-state-menu">
                    {STATE_OPTIONS.map(s => (
                        <button
                            key={s}
                            className={`ap-state-option${s === currentState ? ' ap-state-option-active' : ''}`}
                            style={{'--opt-color': HEALTH_COLORS[colorKey(s)] ?? HEALTH_COLORS.pending}}
                            onClick={() => {
                                onSelect(s);
                                setOpen(false);
                            }}
                        >
                            <i className={`font-icon lni ${STATE_ICONS[s] ?? 'lni-hourglass'}`}/>
                            {STATE_LABELS[s]}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────

export const Page = () => {
    const {t} = useTranslation();
    const {id} = useParams();
    const navigate = useNavigate();
    const {currentProject} = useProjectStore();

    // Core answer
    const {data: answer, isLoading, isError} = useAnswer(id);
    const {mutate: updateAnswer, mutateAsync: updateAnswerAsync, isPending: isUpdating} = useUpdateAnswer();

    // Attachments
    const fileIris = answer?.files ?? [];
    const fileQueries = useFiles(fileIris);
    const resolvedFiles = fileQueries.map((q, i) => ({iri: fileIris[i], ...(q.data ?? {})}));

    const handleDownloadAll = () => {
        resolvedFiles.forEach((f) => {
            const url = f.url ?? (f.bucketUrl ? `${f.bucketUrl}/${f.key}.${f.extension}` : null);
            const name = f.filename ?? f.key ?? 'download';
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.download = name;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
    };

    // Confirm-delete dialog
    const [confirmIri, setConfirmIri] = useState(null);
    const [deleteInProgress, setDeleteInProgress] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [videoLightbox, setVideoLightbox] = useState(null);

    const handleDeleteFile = async (fileIri) => {
        const updatedIris = fileIris.filter(iri => iri !== fileIri);
        await updateAnswerAsync({id, data: {files: updatedIris}});
        try {
            await FilesService.deleteFile(fileIri);
        } catch {
            // Storage deletion failed — restore IRI on the answer
            await updateAnswerAsync({id, data: {files: fileIris}});
        }
        setConfirmIri(null);
        setDeleteInProgress(false);
    };

    // Resolve parents
    const questionIri = answer?.question;
    const questionId = typeof questionIri === 'string' ? questionIri.split('/').pop() : undefined;
    const {data: question} = useQuestion(questionId);

    const planIri = question?.plan;
    const planId = typeof planIri === 'string' ? planIri.split('/').pop() : undefined;
    const {data: plan} = useTestPlan(planId);

    const releaseIri = plan?.release;
    const releaseId = typeof releaseIri === 'string' ? releaseIri.split('/').pop()
        : releaseIri?.id ?? undefined;
    const {data: release} = useRelease(releaseId);

    // Resolve tester
    const testerIri = typeof answer?.tester === 'string' ? answer.tester : null;
    const testerId = testerIri ? testerIri.split('/').pop() : undefined;
    const {data: tester} = useTester(testerId);

    // Sibling answers for navigation
    const {data: siblingsData} = useAnswers({
        question: questionId,
        itemsPerPage: 1000,
        order: {created: 'asc'},
    });
    const siblings = siblingsData?.member ?? [];
    const currentIdx = siblings.findIndex(a => String(a.id) === String(id));
    const prevAnswer = currentIdx > 0 ? siblings[currentIdx - 1] : null;
    const nextAnswer = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

    if (!currentProject?.id) {
        navigate('/app/');
        return null;
    }
    if (isError) return null;

    const state = answer?.state ?? 'pending';
    const stateColor = HEALTH_COLORS[colorKey(state)] ?? HEALTH_COLORS.pending;

    const breadcrumbParents = [
        {label: currentProject?.name ?? 'Project', path: '/app/'},
        ...(release ? [{label: release.name, path: `/app/project/releases/${release.id}`}] : []),
        ...(plan ? [{label: plan.name, path: `/app/project/testing_plans/${planId}`}] : []),
        ...(question ? [{label: question.name, path: `/app/project/questions/${questionId}`}] : []),
    ];

    const displayName = tester?.email ?? answer?.author ?? '—';
    const namePart = displayName.includes('@') ? displayName.split('@')[0] : displayName;

    return (
        <PageContentWrapper>
            <PageTitle
                title={`Answer #${id}`}
                breadcrumbParents={breadcrumbParents}
                breadcrumbLabel={`Answer #${id}`}
            />

            <PageElementWrapper>
                <Row>
                    {/* ── Left col (8) ────────────────────────────────── */}
                    <Col sm={12} xl={8}>
                        <Row>
                            {/* Header card: tester | state | navigation */}
                            <Col>
                                <Card>
                                    <CardBody>
                                        <div className="ap-header-row">

                                            {/* Tester */}
                                            <div className="ap-header-col ap-tester">
                                                <div className="ap-avatar">{initials(namePart)}</div>
                                                <div className="ap-tester-info">
                                                    <span className="ap-tester-name">{namePart}</span>
                                                    {tester?.email && (
                                                        <span
                                                            className="text-muted ap-tester-email">{tester.email}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* State + date */}
                                            <div className="ap-header-col ap-state-col">
                                                {!isLoading && <StateBadge state={state}/>}
                                                <div className="ap-date-wrap">
                                                    <span className="ap-date">{formatDate(answer?.created)}</span>
                                                    <span
                                                        className="text-muted ap-rel">{relativeTime(answer?.created)}</span>
                                                </div>
                                            </div>

                                            {/* Navigation */}
                                            <div className="ap-header-col ap-nav">
                                                <Button
                                                    type="light" size="sm" iconOnly
                                                    disabled={!prevAnswer}
                                                    onClick={() => prevAnswer && navigate(`/app/project/answers/${prevAnswer.id}`)}
                                                >
                                                    <i className="font-icon lni lni-arrow-left"/>
                                                </Button>
                                                <span className="ap-nav-label text-muted">
                                                    {currentIdx >= 0
                                                        ? `${currentIdx + 1} / ${siblings.length}`
                                                        : `#${id}`}
                                                </span>
                                                <Button
                                                    type="light" size="sm" iconOnly
                                                    disabled={!nextAnswer}
                                                    onClick={() => nextAnswer && navigate(`/app/project/answers/${nextAnswer.id}`)}
                                                >
                                                    <i className="font-icon lni lni-arrow-right"/>
                                                </Button>
                                            </div>

                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Tester response */}
                            <Col>
                                <Card>
                                    <CardHeader title={t('Tester response')}/>
                                    <CardBody>
                                        <div className="release-description">
                                            <ReleaseDescription description={answer?.comment}/>
                                        </div>
                                    </CardBody>

                                    {/* Outcome panel */}
                                    <div
                                        className="ap-outcome-panel"
                                        style={{
                                            background: stateColor + '14',
                                            borderColor: stateColor + '50',
                                            color: stateColor,
                                        }}
                                    >
                                        <div className="ap-outcome-title">
                                            <i className={`font-icon lni ${STATE_ICONS[state] ?? 'lni-hourglass'}`}/>
                                            {t('Outcome')}: <strong>{STATE_LABELS[state] ?? state}</strong>
                                        </div>
                                        <p className="ap-outcome-desc">
                                            {STATE_DESCRIPTIONS[state]}
                                        </p>
                                    </div>
                                </Card>
                            </Col>

                            {/* Attachments */}
                            <Col>
                                <Card>
                                    <CardHeader
                                        title={`${t('Attachments')}${resolvedFiles.length ? ` (${resolvedFiles.length})` : ''}`}/>
                                    <CardBody>
                                        {resolvedFiles.length === 0 ? (
                                            <div className="ap-empty-state text-muted">
                                                <i className="font-icon lni lni-paperclip-2 ap-empty-icon"/>
                                                <span>{t('No attachments on this answer.')}</span>
                                            </div>
                                        ) : (() => {
                                            const imageFiles = resolvedFiles.filter(f => {
                                                const ext = (f.extension ?? '').toLowerCase();
                                                const url = f.url ?? (f.bucketUrl ? `${f.bucketUrl}/${f.key}.${f.extension}` : null);
                                                return IMAGE_EXTS.has(ext) && url;
                                            }).map(f => ({
                                                url: f.url ?? `${f.bucketUrl}/${f.key}.${f.extension}`,
                                                name: f.filename ?? f.key ?? '—',
                                                size: f.size ?? null,
                                            }));
                                            return (
                                                <>
                                                    <div className="tpd-attach-grid">
                                                        {resolvedFiles.map((f, i) => {
                                                            const ext = (f.extension ?? '').toLowerCase();
                                                            const url = f.url ?? (f.bucketUrl ? `${f.bucketUrl}/${f.key}.${f.extension}` : null);
                                                            const isImg = IMAGE_EXTS.has(ext) && url;
                                                            const isVideo = VIDEO_EXTS.has(ext) && url;
                                                            const imgIdx = isImg ? imageFiles.findIndex(img => img.url === url) : -1;
                                                            return (
                                                                <AttachmentItem
                                                                    key={f.iri ?? i}
                                                                    file={f}
                                                                    onDelete={(iri) => setConfirmIri(iri)}
                                                                    onImageClick={isImg ? () => setLightboxIndex(imgIdx) : undefined}
                                                                    onVideoClick={isVideo ? () => setVideoLightbox({
                                                                        url,
                                                                        name: f.filename ?? f.key ?? '—',
                                                                        size: f.size ?? null
                                                                    }) : undefined}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                    {lightboxIndex !== null && imageFiles.length > 0 && (
                                                        <ImageLightbox
                                                            images={imageFiles}
                                                            initialIndex={lightboxIndex}
                                                            onClose={() => setLightboxIndex(null)}
                                                        />
                                                    )}
                                                    {videoLightbox && (
                                                        <VideoLightbox
                                                            url={videoLightbox.url}
                                                            name={videoLightbox.name}
                                                            size={videoLightbox.size}
                                                            onClose={() => setVideoLightbox(null)}
                                                        />
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* System info */}
                            <Col>
                                <Card>
                                    <CardHeader title={t('System information')}/>
                                    <CardBody>
                                        {answer?.systemInfos && Object.keys(answer.systemInfos).length > 0 ? (
                                            <div className="ap-sysinfo-grid">
                                                {Object.entries(answer.systemInfos).map(([k, v]) => {
                                                    const icon = iconForKey(k, v);
                                                    return (
                                                        <div className="ap-sysinfo-row" key={k}>
                                                            {icon &&
                                                                <i className={`font-icon lni ${icon} ap-sysinfo-icon`}/>}
                                                            <span className="ap-sysinfo-label">{k}</span>
                                                            <span className="ap-sysinfo-sep">·</span>
                                                            <span className="ap-sysinfo-value">{String(v)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-muted m-0">{t('No system information recorded.')}</p>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    {/* ── Right col (4) ───────────────────────────────── */}
                    <Col sm={12} xl={4}>
                        <Row>
                            {/* Context */}
                            <Col>
                                <Card>
                                    <CardHeader title={t('Context')}/>
                                    <CardBody>
                                        <div className="ap-context-list">
                                            <ContextRow label={t('Question')} value={question?.name}/>
                                            <ContextRow label={t('Testing Plan')} value={plan?.name}/>
                                            <ContextRow label={t('Due date')}
                                                        value={plan?.dueDate ? formatDate(plan.dueDate) : null}/>
                                            <ContextRow label={t('Release')} value={release?.name}/>
                                            <ContextRow label={t('Submitted')} value={formatDate(answer?.created)}/>
                                            <ContextRow label={t('Last updated')} value={formatDate(answer?.updated)}/>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>

                            {/* Quick actions */}
                            <Col>
                                <Card>
                                    <CardHeader title={t('Quick actions')}/>
                                    <CardGroup className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-column">
                                            <div className="heading">{t('Change state')}</div>
                                            <div
                                                className="text-muted small">{t('Update the outcome of this answer')}</div>
                                        </div>
                                        <StateDropdown
                                            currentState={state}
                                            loading={isUpdating}
                                            onSelect={(newState) => updateAnswer({id, data: {state: newState}})}
                                        />
                                    </CardGroup>
                                    <CardGroup className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-column">
                                            <div className="heading">{t('Mark as important')}</div>
                                            <div
                                                className="text-muted small">{t('Flag this answer for follow-up')}</div>
                                        </div>
                                        <Button iconOnly type="light" size="sm">
                                            <i className="font-icon lni lni-star-fat"/>
                                        </Button>
                                    </CardGroup>
                                    <CardGroup className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-column">
                                            <div className="heading">{t('Download attachments')}</div>
                                            <div
                                                className="text-muted small">{t('Download all files from this answer')}</div>
                                        </div>
                                        <Button iconOnly type="light" size="sm" onClick={handleDownloadAll}
                                                disabled={resolvedFiles.length === 0}>
                                            <i className="font-icon lni lni-download-1"/>
                                        </Button>
                                    </CardGroup>
                                    <CardGroup className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-column">
                                            <div className="heading">{t('Export')}</div>
                                            <div className="text-muted small">{t('Download this answer as CSV')}</div>
                                        </div>
                                        <Button iconOnly type="light" size="sm">
                                            <i className="font-icon lni lni-download-1"/>
                                        </Button>
                                    </CardGroup>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </PageElementWrapper>
            {/* Confirm file delete */}
            <Modal
                isOpen={!!confirmIri}
                onRequestClose={() => !deleteInProgress && setConfirmIri(null)}
                style={CONFIRM_MODAL_STYLES}
            >
                <div className="modal-header">
                    <h5 className="modal-title">{t('Delete attachment')}</h5>
                </div>
                <div className="modal-body">
                    <p>{t('Are you sure you want to permanently delete this file? This action cannot be undone.')}</p>
                </div>
                <div className="modal-footer gap-2">
                    <Button type="light" size="sm" onClick={() => setConfirmIri(null)} disabled={deleteInProgress}>
                        {t('Cancel')}
                    </Button>
                    <Button
                        type="danger"
                        size="sm"
                        loading={deleteInProgress}
                        onClick={async () => {
                            setDeleteInProgress(true);
                            await handleDeleteFile(confirmIri);
                        }}
                    >
                        {t('Delete')}
                    </Button>
                </div>
            </Modal>
        </PageContentWrapper>
    );
};
