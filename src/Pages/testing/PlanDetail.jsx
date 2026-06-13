import {useEffect, useMemo, useRef, useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {useParams} from "react-router";
import {useTranslation} from "react-i18next";
import {useQueries} from "@tanstack/react-query";
import {PageContentWrapper} from "../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../Components/Navigation/PageElementWrapper.jsx";
import {Loader} from "../../Components/UI/Loader.jsx";
import {Button} from "../../Components/UI/Buttons/Button.jsx";
import {TabWrapper} from "../../Components/UI/Tabs/TabWrapper.jsx";
import {Tab} from "../../Components/UI/Tabs/Tab.jsx";
import {useTestPlan} from "../../Hooks/queries/useTestPlansQuery.js";
import {useProject} from "../../Hooks/queries/useProjectsQuery.js";
import {useQuestions} from "../../Hooks/queries/useQuestionsQuery.js";
import AnswersService from "../../Services/PrivateApi/AnswersService.js";
import {useAnswers, useCreateAnswer, useUpdateAnswer} from "../../Hooks/queries/useAnswersQuery.js";
import {useFiles} from "../../Hooks/queries/useFilesQuery.js";
import FilesService from "../../Services/PrivateApi/FilesService.js";
import Uploader from "../../Components/UI/Uploader/Uploader.jsx";
import AttachmentItem, {IMAGE_EXTS, VIDEO_EXTS} from "../../Components/UI/Uploader/AttachmentItem.jsx";
import ImageLightbox from "../../Components/UI/Lightbox/ImageLightbox.jsx";
import VideoLightbox from "../../Components/UI/Lightbox/VideoLightbox.jsx";
import {MkEditorInstance} from "../../Components/UI/Form/Editor/MkEditorInstance.jsx";
import {MarkdownRenderer} from "../../Components/UI/Markdown/MarkdownRenderer.jsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
};

const daysUntil = (iso) => {
    if (!iso) return null;
    return Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
};

// ── Hero ──────────────────────────────────────────────────────────────────────

const PlanHero = ({plan, t}) => {
    const days = daysUntil(plan?.dueDate);
    const projectIri = plan?.release?.project;
    const projectId = typeof projectIri === 'string' ? projectIri.split('/').pop() : null;
    const {data: project} = useProject(projectId);

    return (
        <div className="tpd-hero">
            <div className="tpd-hero-bg">
                <img src="/assets/test_plan_tester_bg.png" alt=""/>
            </div>
            <div className="tpd-hero-overlay"/>
            <div className="tpd-hero-content">
                <div className="tpd-hero-left">
                    <div className="tpd-hero-thumb">
                        <img src="/assets/testing_open.jpg" alt=""/>
                    </div>
                    <div>
                        <h1 className="tpd-hero-title">{plan?.name}</h1>
                        <p className="tpd-hero-desc">{plan?.description}</p>
                        <div className="tpd-hero-chips">
                            {project?.name && (
                                <span className="tpd-chip">
                                    <i className="font-icon lni lni-briefcase-2"/> {project.name}
                                </span>
                            )}
                            {plan?.release?.name && (
                                <span className="tpd-chip">
                                    <i className="font-icon lni lni-git"/> {plan.release.name}
                                </span>
                            )}
                            <span className="tpd-chip">
                                <i className="font-icon lni lni-check-square-2"/> {plan?.totalQuestions ?? 0} {t(plan?.totalQuestions !== 1 ? 'Questions' : 'Question')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="tpd-hero-right">
                    <span className="tpd-hero-status">
                        <span className="tpd-status-dot"/>
                        {t('In progress')}
                    </span>
                    {plan?.dueDate && (
                        <div className="tpd-hero-due">
                            <div className="tpd-hero-due-label">
                                <i className="font-icon lni lni-calendar-days"/>
                                {days !== null && days > 0
                                    ? t('Due in {{count}} days', {count: days})
                                    : days === 0 ? t('Due today') : t('Overdue')}
                            </div>
                            <div className="tpd-hero-due-date">{formatDate(plan.dueDate)}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Status donut (placeholder data, pure SVG) ─────────────────────────────────

const SvgDonut = ({data, size = 160, thickness = 26}) => {
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circ = 2 * Math.PI * r;
    const total = data.reduce((s, d) => s + d.value, 0);
    let offset = 0;

    return (
        <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
            {data.map((d, i) => {
                const dash = (d.value / total) * circ;
                const gap = circ - dash;
                const el = (
                    <circle
                        key={i}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={thickness}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
};

const StatusDonut = ({plan, t}) => {
    const planId = typeof plan?.id === 'string' ? plan.id.split('/').pop() : plan?.id;
    const questionsOrder = plan?.questionsOrder ?? [];

    const {data: questions = []} = useQuestions({
        plan: `/api/test_plans/${planId}`,
        'order[id]': 'asc',
    });

    const sorted = useMemo(() => {
        if (!questions.length) return [];
        if (questionsOrder.length) {
            const indexMap = Object.fromEntries(questionsOrder.map((iri, i) => [iri, i]));
            return [...questions].sort((a, b) => (indexMap[a['@id']] ?? Infinity) - (indexMap[b['@id']] ?? Infinity));
        }
        return [...questions].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }, [questions, questionsOrder]);

    const answerQueries = useQueries({
        queries: sorted.map(q => ({
            queryKey: ['tester-answer', q['@id']],
            queryFn: () => AnswersService.getAnswers({question: q['@id']}).then(r => {
                const members = r.data['member'] ?? r.data['hydra:member'] ?? [];
                return members[0] ?? null;
            }),
            enabled: !!q['@id'],
            staleTime: 60_000,
        })),
    });

    const counts = useMemo(() => {
        let answered = 0, inProgress = 0, notStarted = 0;
        sorted.forEach((q, i) => {
            const answer = answerQueries[i]?.data;
            if (!answer) notStarted++;
            else if (answer.state === 'pending') inProgress++;
            else answered++;
        });
        return {answered, inProgress, notStarted};
    }, [answerQueries, sorted]);

    const total = sorted.length || 1;

    const data = [
        {name: t('Answered'), value: counts.answered, color: '#22c55e'},
        {name: t('In progress'), value: counts.inProgress, color: '#f59e0b'},
        {name: t('Not started'), value: counts.notStarted, color: '#e2e8f0'},
    ];

    return (
        <div className="tpd-card">
            <div className="tpd-card-title">{t('Questions by Status')}</div>
            <div className="tpd-donut-wrap">
                <div className="tpd-donut-chart">
                    <SvgDonut
                        data={data.filter(d => d.value > 0).length ? data : [{name: '', value: 1, color: '#e2e8f0'}]}/>
                    <div className="tpd-donut-center">
                        <span className="tpd-donut-total">{sorted.length}</span>
                        <span className="tpd-donut-label">{t('Total')}</span>
                    </div>
                </div>
                <div className="tpd-donut-legend">
                    {data.map((d, i) => (
                        <div key={i} className="tpd-donut-legend-row">
                            <span className="tpd-donut-dot" style={{background: d.color}}/>
                            <span className="tpd-donut-name">{d.name}</span>
                            <span className="tpd-donut-count">{d.value} ({Math.round(d.value / total * 100)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Recent activity (placeholder) ─────────────────────────────────────────────

const ACTIVITY_PLACEHOLDER = [
    {
        icon: 'lni-check-circle-1',
        color: '#22c55e',
        text: 'You answered "UI-05: Empty state"',
        time: '2 hours ago',
        action: 'View Answer'
    },
    {
        icon: 'lni-check-circle-1',
        color: '#22c55e',
        text: 'You answered "UI-02: Login flow"',
        time: 'Yesterday',
        action: 'View Answer'
    },
    {
        icon: 'lni-bolt-2',
        color: '#f59e0b',
        text: 'You started "UI-07: Search functionality"',
        time: 'Yesterday',
        action: 'Continue'
    },
];

const RecentActivity = ({t}) => (
    <div className="tpd-card">
        <div className="tpd-card-title">{t('Recent Activity')}</div>
        <div className="tpd-activity-list">
            {ACTIVITY_PLACEHOLDER.map((item, i) => (
                <div key={i} className="tpd-activity-row">
                    <i className={`font-icon lni ${item.icon} tpd-activity-icon`} style={{color: item.color}}/>
                    <div className="tpd-activity-body">
                        <div className="tpd-activity-text">{item.text}</div>
                        <div className="tpd-activity-time">{item.time}</div>
                    </div>
                    <Button type="light" size="sm" onClick={() => {
                    }}>{t(item.action)}</Button>
                </div>
            ))}
        </div>
    </div>
);

// ── Need help cards ───────────────────────────────────────────────────────────

/** Horizontal — used at the bottom of the overview main column */
const NeedHelp = ({t}) => (
    <div className="tpd-card tpd-need-help">
        <img src="/assets/gator_avatar.png" alt=""/>
        <div className="tpd-need-help-body">
            <div className="tpd-need-help-title">{t('Need help?')}</div>
            <p>{t('Read the documentation or contact your test manager if you have any questions.')}</p>
        </div>
        <div className="tpd-need-help-actions">
            <Button type="primary" outline={true} size="sm" icon="lni-book-1" onClick={() => {
            }}>{t('Documentation')}</Button>
            <Button type="primary" outline={true} size="sm" icon="lni-envelope-1" onClick={() => {
            }}>{t('Contact Manager')}</Button>
        </div>
    </div>
);

/** Vertical — used in the narrow sidebar of the questions tab */
const NeedHelpSidebar = ({t}) => (
    <div className="tpd-card tpd-need-help-sidebar">
        <img src="/assets/gator_avatar.png" alt=""/>
        <div className="tpd-need-help-title">{t('Need help?')}</div>
        <p className="tpd-need-help-sidebar-desc">{t('Read the documentation or contact your test manager if you have any questions.')}</p>
        <Button type="primary" outline={true} size="sm" icon="lni-book-1" fullWidth onClick={() => {
        }}>{t('Documentation')}</Button>
        <Button type="primary" outline={true} size="sm" icon="lni-envelope-1" fullWidth onClick={() => {
        }}>{t('Contact Manager')}</Button>
    </div>
);

// ── Description ───────────────────────────────────────────────────────────────

const PlanDescription = ({plan, t}) => {
    const [expanded, setExpanded] = useState(false);
    const text = plan?.description ?? '';
    const long = text.length > 300;
    const displayed = !expanded && long ? text.slice(0, 300) + '…' : text;

    return (
        <div className="tpd-card">
            <div className="tpd-card-title">{t('Plan Description')}</div>
            <p className="tpd-desc-text">{displayed}</p>
            {plan?.content && <p className="tpd-desc-text">{plan.content}</p>}
            {long && (
                <Button type="link" size="sm" onClick={() => setExpanded(e => !e)}>
                    {expanded ? t('Show less') : t('Show more')}
                </Button>
            )}
        </div>
    );
};

// ── Questions list ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const formatRelative = (iso) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins || 1} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
};

const QuestionsList = ({plan, t, onOpenDrawer}) => {
    const planId = typeof plan?.id === 'string' ? plan.id.split('/').pop() : plan?.id;
    const questionsOrder = plan?.questionsOrder ?? [];

    const {data: questions = [], isLoading} = useQuestions({
        plan: `/api/test_plans/${planId}`,
        'order[id]': 'asc',
    });

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Sort by questionsOrder IRI array (same logic as ListQuestionsOrdered)
    const sorted = useMemo(() => {
        if (!questions.length) return [];
        if (questionsOrder.length) {
            const indexMap = Object.fromEntries(questionsOrder.map((iri, i) => [iri, i]));
            return [...questions].sort((a, b) => {
                const ia = indexMap[a['@id']] ?? Infinity;
                const ib = indexMap[b['@id']] ?? Infinity;
                return ia - ib;
            });
        }
        return [...questions].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }, [questions, questionsOrder]);

    // Client-side search on name + content
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return sorted;
        return sorted.filter(item =>
            (item.name ?? '').toLowerCase().includes(q) ||
            (item.content ?? '').toLowerCase().includes(q)
        );
    }, [sorted, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    // Fetch tester's answers for every question in the plan (TesterScopeExtension auto-scopes)
    const answerQueries = useQueries({
        queries: sorted.map(q => ({
            queryKey: ['tester-answer', q['@id']],
            queryFn: () => AnswersService.getAnswers({question: q['@id']}).then(r => {
                const members = r.data['member'] ?? r.data['hydra:member'] ?? [];
                return members[0] ?? null; // at most one answer per tester per question
            }),
            enabled: !!q['@id'],
            staleTime: 60_000,
        })),
    });

    // Map questionIri -> answer object
    const answerByQuestion = useMemo(() => {
        const map = {};
        sorted.forEach((q, i) => {
            if (answerQueries[i]?.data !== undefined) {
                map[q['@id']] = answerQueries[i].data;
            }
        });
        return map;
    }, [answerQueries, sorted]);

    // Reset to page 1 when search changes
    const handleSearch = (v) => {
        setSearch(v);
        setPage(1);
    };

    if (isLoading) return <Loader/>;

    const STATE_META = {
        pass: {label: 'Pass', color: '#69BC9E', icon: 'lni-check-circle-1'},
        pass_with_bugs: {label: 'Pass with bugs', color: '#a8d5c2', icon: 'lni-check-circle-1'},
        failed: {label: 'Failed', color: '#ef4444', icon: 'lni-xmark-circle'},
        blocked: {label: 'Blocked', color: '#f59e0b', icon: 'lni-locked-1'},
        pending: {label: 'Pending', color: '#d1d5db', icon: 'lni-hourglass'},
    };

    const AnswerStateCell = ({answer}) => {
        if (!answer?.state || answer.state === 'pending') return <span className="tpd-q-no-state">—</span>;
        const meta = STATE_META[answer.state] ?? STATE_META.pending;
        return (
            <span className="tpd-q-answer-state"
                  style={{color: meta.color, background: meta.color + '18', borderColor: meta.color + '40'}}>
                <i className={`font-icon lni ${meta.icon}`}/>
                {t(meta.label)}
            </span>
        );
    };

    const getRowStatus = (answer) => {
        if (!answer) return 'not_started';
        if (answer.state === 'pending') return 'in_progress';
        return 'answered';
    };

    const StatusCell = ({answer}) => {
        const status = getRowStatus(answer);
        const map = {
            not_started: {cls: 'tpd-q-status--not-started', label: t('Not Started')},
            in_progress: {cls: 'tpd-q-status--in-progress', label: t('In Progress')},
            answered: {cls: 'tpd-q-status--answered', label: t('Answered')},
        };
        const {cls, label} = map[status];
        return <span className={`tpd-q-status ${cls}`}><span className="tpd-q-dot"/>{label}</span>;
    };

    const ActionCell = ({answer, onClick}) => {
        const status = getRowStatus(answer);
        if (status === 'not_started') return <Button type="primary" outline size="sm"
                                                     onClick={onClick}>{t('Start')}</Button>;
        if (status === 'in_progress') return <Button type="primary" outline size="sm"
                                                     onClick={onClick}>{t('Continue')}</Button>;
        return <Button type="primary" outline size="sm" onClick={onClick}>{t('View Answer')}</Button>;
    };

    return (
        <div className="tpd-q-wrap">
            {/* Toolbar */}
            <div className="tpd-q-toolbar">
                <span className="tpd-q-toolbar-title">{t('All Questions')} <span
                    className="tpd-q-count">({filtered.length})</span></span>
                <div className="tpd-q-search">
                    <i className="font-icon lni lni-search-alt-1"/>
                    <input
                        type="text"
                        placeholder={t('Search questions...')}
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            {!filtered.length ? (
                <div className="tpd-empty">
                    <i className="font-icon lni lni-check-square-2"/>
                    {t('No questions found.')}
                </div>
            ) : (
                <>
                    <table className="tpd-q-table">
                        <thead>
                        <tr>
                            <th className="tpd-q-th-num">#</th>
                            <th>{t('Question')}</th>
                            <th className="tpd-q-th-status">{t('Status')}</th>
                            <th className="tpd-q-th-answer-state">{t('Answer')}</th>
                            <th className="tpd-q-th-updated">{t('Last Updated')}</th>
                            <th className="tpd-q-th-action"/>
                        </tr>
                        </thead>
                        <tbody>
                        {paged.map((q, i) => {
                            const globalIdx = (safePage - 1) * PAGE_SIZE + i;
                            const code = `Q-${String(globalIdx + 1).padStart(2, '0')}`;
                            const answer = answerByQuestion[q['@id']];
                            return (
                                <tr key={q.id ?? i} className="tpd-q-row">
                                    <td className="tpd-q-code">{code}</td>
                                    <td className="tpd-q-name">{q.name}</td>
                                    <td><StatusCell answer={answer}/></td>
                                    <td><AnswerStateCell answer={answer}/></td>
                                    <td className="tpd-q-updated">{answer ? formatRelative(answer.updated) : '—'}</td>
                                    <td className="tpd-q-action">
                                        <ActionCell answer={answer} onClick={() => onOpenDrawer({
                                            question: q,
                                            answer,
                                            index: globalIdx,
                                            total: filtered.length
                                        })}/>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="tpd-q-pagination">
                            <span className="tpd-q-page-info">{PAGE_SIZE} {t('per page')}</span>
                            <div className="tpd-q-pages">
                                <button className="tpd-q-page-btn" disabled={safePage === 1}
                                        onClick={() => setPage(p => p - 1)}>
                                    <i className="font-icon lni lni-chevron-left"/>
                                </button>
                                {Array.from({length: totalPages}, (_, i) => (
                                    <button
                                        key={i}
                                        className={`tpd-q-page-btn${safePage === i + 1 ? ' is-active' : ''}`}
                                        onClick={() => setPage(i + 1)}
                                    >{i + 1}</button>
                                ))}
                                <button className="tpd-q-page-btn" disabled={safePage === totalPages}
                                        onClick={() => setPage(p => p + 1)}>
                                    <i className="font-icon lni lni-chevron-right"/>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// ── Question drawer ───────────────────────────────────────────────────────────

const ANSWER_OPTIONS = [
    {state: 'pass', label: 'Pass', desc: 'Everything works as expected.', color: '#69BC9E'},
    {state: 'pass_with_bugs', label: 'Pass with bugs', desc: 'It works but there are minor issues.', color: '#a8d5c2'},
    {state: 'failed', label: 'Failed', desc: 'The scenario does not work as expected.', color: '#ef4444'},
    {state: 'blocked', label: 'Blocked', desc: 'I cannot proceed with this test.', color: '#f59e0b'},
    {state: 'pending', label: 'Pending', desc: 'I have started but not finished yet.', color: '#d1d5db'},
];


const CLOSE_DURATION = 220; // must match CSS animation duration

const QuestionDrawer = ({question, answer, index, total, onClose, onSaved, t}) => {
    const [isClosing, setIsClosing] = useState(false);
    const [selectedState, setSelectedState] = useState(answer?.state ?? null);
    const [comment, setComment] = useState(answer?.comment ?? '');
    const [liveAnswerId, setLiveAnswerId] = useState(answer?.id ?? null);
    // IRIs already on the answer (from API) — resolved via useFiles
    // fileIrisRef mirrors fileIris so handleUploaded always reads the latest list
    // even before React re-renders (important when multiple files are uploaded at once)
    const [fileIris, _setFileIris] = useState(answer?.files ?? []);
    const fileIrisRef = useRef(answer?.files ?? []);
    const setFileIris = (iris) => {
        fileIrisRef.current = iris;
        _setFileIris(iris);
    };
    // Image lightbox: index into imageFiles array, null = closed
    const [lightboxIndex, setLightboxIndex] = useState(null);
    // Video lightbox: {url, name, size} or null
    const [videoLightbox, setVideoLightbox] = useState(null);
    // Metadata for files uploaded this session (url/ext/size available immediately)
    const [sessionMeta, setSessionMeta] = useState({});
    // Incremented together with comment so MkEditorInstance remounts after comment is set
    const [editorKey, setEditorKey] = useState(0);

    const createAnswer = useCreateAnswer();
    const updateAnswer = useUpdateAnswer();
    const isPending = createAnswer.isPending || updateAnswer.isPending;

    // Fetch fresh answer data every time the drawer opens for this question
    const {data: freshAnswerData} = useAnswers(
        question ? {question: question['@id']} : {}
    );
    const freshAnswer = freshAnswerData?.['member']?.[0]
        ?? freshAnswerData?.['hydra:member']?.[0]
        ?? null;

    // Use fresh API data as the effective answer (falls back to prop snapshot while loading)
    const effectiveAnswer = freshAnswer ?? answer;
    const isExisting = !!effectiveAnswer?.id;

    // Fetch file objects for each IRI (API returns plain IRIs in answer.files)
    const fileQueries = useFiles(fileIris);

    // Merge API data with any session-upload metadata we already have
    const resolvedFiles = fileQueries.map((q, i) => {
        const iri = fileIris[i];
        const apiData = q.data ?? {};
        return {iri, ...apiData, ...(sessionMeta[iri] ?? {})};
    });

    // Sync state when fresh answer data arrives from the API.
    // editorKey increments in the same batch so MkEditorInstance remounts
    // only after comment has the correct value (MDXEditor is uncontrolled).
    useEffect(() => {
        setSelectedState(effectiveAnswer?.state ?? null);
        setComment(effectiveAnswer?.comment ?? '');
        setLiveAnswerId(effectiveAnswer?.id ?? null);
        setFileIris(effectiveAnswer?.files ?? []);
        setSessionMeta({});
        setEditorKey(k => k + 1);
    }, [effectiveAnswer]);

    if (!question) return null;

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, CLOSE_DURATION);
    };

    const code = `Q-${String((index ?? 0) + 1).padStart(2, '0')}`;

    // Ensure an answer record exists; returns its numeric id
    const ensureAnswer = async () => {
        if (liveAnswerId) return liveAnswerId;
        const created = await createAnswer.mutateAsync({
            question: question['@id'],
            state: selectedState ?? 'pending',
            comment,
        });
        const id = created?.id ?? null;
        setLiveAnswerId(id);
        return id;
    };

    const isExistingForSave = !!liveAnswerId;

    // Remove a file: PATCH answer first, then DELETE storage.
    // If storage deletion fails, re-PATCH to restore the file.
    const handleDeleteFile = async (fileIri) => {
        const id = liveAnswerId;
        if (!id) return;
        const originalIris = fileIrisRef.current;
        const updatedIris = originalIris.filter(iri => iri !== fileIri);
        await updateAnswer.mutateAsync({id, data: {files: updatedIris}});
        setFileIris(updatedIris);
        setSessionMeta(prev => {
            const next = {...prev};
            delete next[fileIri];
            return next;
        });
        try {
            await FilesService.deleteFile(fileIri);
        } catch {
            // Storage deletion failed — restore the original list (captured before removal)
            await updateAnswer.mutateAsync({id, data: {files: originalIris}});
            setFileIris(originalIris);
        }
    };

    // Called by Uploader for each file — patch files list immediately, no save needed.
    // Reads fileIrisRef.current (not the stale closure) so multi-file uploads accumulate correctly.
    const handleUploaded = async (fileIri, meta) => {
        const id = await ensureAnswer();
        if (!id) return;
        // Use ref for the current list — state may be stale if multiple files are in flight
        const updatedIris = [...fileIrisRef.current, fileIri];
        // Update ref immediately so the next file sees the new list before React re-renders
        setFileIris(updatedIris);
        await updateAnswer.mutateAsync({id, data: {files: updatedIris}});
        // Store upload-time metadata so we can show it before the API fetch resolves
        setSessionMeta(prev => ({...prev, [fileIri]: meta}));
    };

    const handleSave = async () => {
        if (!selectedState) return;
        if (liveAnswerId) {
            await updateAnswer.mutateAsync({id: liveAnswerId, data: {state: selectedState, comment}});
        } else {
            await createAnswer.mutateAsync({question: question['@id'], state: selectedState, comment});
        }
        onSaved?.();
        triggerClose();
    };

    return (
        <>
            <div className={`tpd-drawer-overlay${isClosing ? ' is-closing' : ''}`} onClick={triggerClose}/>
            <div className={`tpd-drawer${isClosing ? ' is-closing' : ''}`}>
                {/* Header */}
                <div className="tpd-drawer-header">
                    <div className="tpd-drawer-header-left">
                        <span className="tpd-drawer-counter">{code} <span
                            className="tpd-drawer-counter-sep">/</span> {total}</span>
                        <span className="tpd-drawer-title">{question.name}</span>
                    </div>
                    <button className="tpd-drawer-close" onClick={triggerClose}>
                        <i className="font-icon lni lni-xmark"/>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="tpd-drawer-body">
                    {/* Content / instructions */}
                    {question.content && (
                        <div className="tpd-drawer-section">
                            <div className="tpd-drawer-section-title">{t('Expected Result')}</div>
                            <div className="tpd-drawer-expected tpd-drawer-md">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.content}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Answer radio */}
                    <div className="tpd-drawer-section">
                        <div className="tpd-drawer-section-title">{t('Your Answer')} <span
                            className="tpd-drawer-required">*</span></div>
                        <div className="tpd-drawer-options">
                            {ANSWER_OPTIONS.map(opt => {
                                const sel = selectedState === opt.state;
                                return (
                                    <label
                                        key={opt.state}
                                        className={`tpd-drawer-option${sel ? ' is-selected' : ''}`}
                                        style={sel ? {borderColor: opt.color, background: opt.color + '14'} : {}}
                                        onClick={() => setSelectedState(opt.state)}
                                    >
                                        <span
                                            className={`tpd-drawer-radio${sel ? ' is-selected' : ''}`}
                                            style={sel ? {borderColor: opt.color} : {}}
                                        >
                                            {sel && <span className="tpd-drawer-radio-dot"
                                                          style={{background: opt.color}}/>}
                                        </span>
                                        <div>
                                            <div className="tpd-drawer-option-label"
                                                 style={sel ? {color: opt.color} : {}}>{t(opt.label)}</div>
                                            <div className="tpd-drawer-option-desc">{t(opt.desc)}</div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="tpd-drawer-section">
                        <div className="tpd-drawer-section-title">{t('Comments')}</div>
                        <MkEditorInstance
                            key={editorKey}
                            value={comment}
                            onChange={setComment}
                            className="tpd-drawer-md-editor"
                        />
                    </div>

                    {/* Attachments */}
                    {resolvedFiles.length > 0 && (() => {
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
                            <div className="tpd-drawer-section">
                                <div className="tpd-drawer-section-title">
                                    <i className="font-icon lni lni-paperclip-2" style={{marginRight: '.375rem'}}/>
                                    {t('Attachments')} ({resolvedFiles.length})
                                </div>
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
                                                onDelete={handleDeleteFile}
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
                            </div>
                        );
                    })()}
                </div>

                {/* Footer */}
                <div className="tpd-drawer-footer">
                    <div className="tpd-drawer-footer-left">
                        <Uploader onUploaded={handleUploaded}/>
                    </div>
                    <div className="tpd-drawer-footer-right">
                        <Button type="light" size="md" onClick={triggerClose}>{t('Cancel')}</Button>
                        <Button
                            type="primary"
                            size="md"
                            loading={isPending}
                            disabled={!selectedState}
                            onClick={handleSave}
                        >
                            {isExistingForSave ? t('Update') : t('Save')}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

// ── Release tab ───────────────────────────────────────────────────────────────

const ReleaseTab = ({plan, t}) => {
    const release = plan?.release;
    if (!release) return null;

    return (
        <div className="tpd-release-tab">
            <div className="tpd-card tpd-release-card">
                <div className="tpd-release-header">
                    <i className="font-icon lni lni-git tpd-release-icon"/>
                    <div>
                        <h2 className="tpd-release-name">{release.name}</h2>
                        {release.description && (
                            <p className="tpd-release-subtitle">{t('Release notes')}</p>
                        )}
                    </div>
                </div>
                {release.description ? (
                    <div className="tpd-release-body tpd-drawer-md">
                        <MarkdownRenderer markdown={release.description}/>
                    </div>
                ) : (
                    <p className="tpd-release-empty text-muted">{t('No description for this release.')}</p>
                )}
            </div>
        </div>
    );
};

// ── Project tab ───────────────────────────────────────────────────────────────

const ProjectTab = ({plan, t}) => {
    const projectIri = plan?.release?.project; // IRI string e.g. "/api/projects/5"
    const projectId = typeof projectIri === 'string' ? projectIri.split('/').pop() : null;
    const {data: project} = useProject(projectId);

    if (!projectId) return null;

    const pic = project?.picture;
    const pictureUrl = pic?.url ?? (pic?.bucketUrl && pic?.key ? `${pic.bucketUrl}/${pic.key}${pic.extension ? `.${pic.extension}` : ''}` : null);

    return (
        <div className="tpd-release-tab">
            <div className="tpd-card tpd-release-card">
                <div className="tpd-release-header">
                    {pictureUrl ? (
                        <img src={pictureUrl} alt={project?.name} className="tpd-project-picture"/>
                    ) : (
                        <div className="tpd-project-picture tpd-project-picture--placeholder">
                            <i className="font-icon lni lni-briefcase-2"/>
                        </div>
                    )}
                    <div>
                        <h2 className="tpd-release-name">{project?.name}</h2>
                        {project?.description && (
                            <p className="tpd-release-subtitle">{t('Project')}</p>
                        )}
                    </div>
                </div>
                {project?.description ? (
                    <div className="tpd-release-body tpd-drawer-md">
                        <MarkdownRenderer markdown={project.description}/>
                    </div>
                ) : (
                    <p className="tpd-release-empty text-muted">{t('No description for this project.')}</p>
                )}
            </div>
        </div>
    );
};

// ── Activity coming soon ──────────────────────────────────────────────────────

const ActivityComingSoon = ({t}) => (
    <div className="tpd-coming-soon">
        <i className="font-icon lni lni-bolt-2"/>
        <div className="tpd-coming-soon-title">{t('Activity feed coming soon')}</div>
        <p>{t('We\'re working on it. Check back later!')}</p>
    </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export const PlanDetail = () => {
    const {t} = useTranslation();
    const {id} = useParams();
    const {data: plan, isLoading} = useTestPlan(id);
    const [drawer, setDrawer] = useState(null); // {question, answer}

    return (
        <PageContentWrapper>
            <PageTitle
                title={plan?.name ?? t('Loading…')}
                breadcrumbParents={[{label: t('My Plans'), path: '/testing/plans'}]}
                breadcrumbLabel={plan?.name ?? '…'}
            />
            <PageElementWrapper>
                {isLoading ? (
                    <Loader/>
                ) : (
                    <div className="tpd-root">
                        <PlanHero plan={plan} t={t}/>
                        <TabWrapper inUrlParams={true} name="tab">
                            <Tab icon="lni-book-1" active={true} name="overview" title={t('Overview')}>
                                <div className="tpd-overview-grid">
                                    <div className="tpd-col-main">
                                        <PlanDescription plan={plan} t={t}/>
                                        <NeedHelp t={t}/>
                                    </div>
                                    <div className="tpd-col-side">
                                        <StatusDonut plan={plan} t={t}/>
                                        <RecentActivity t={t}/>
                                    </div>
                                </div>
                            </Tab>
                            <Tab icon="lni-check-square-2" name="questions" title={t('Questions')}
                                 badge={plan?.totalQuestions}>
                                <div className="tpd-overview-grid">
                                    <div className="tpd-col-main">
                                        <div className="tpd-card">
                                            <QuestionsList plan={plan} t={t} onOpenDrawer={setDrawer}/>
                                        </div>
                                    </div>
                                    <div className="tpd-col-side">
                                        <NeedHelpSidebar t={t}/>
                                    </div>
                                </div>
                            </Tab>
                            <Tab icon="lni-git" name="release" title={t('Release')}>
                                <ReleaseTab plan={plan} t={t}/>
                            </Tab>
                            <Tab icon="lni-briefcase-2" name="project" title={t('Project')}>
                                <ProjectTab plan={plan} t={t}/>
                            </Tab>
                        </TabWrapper>
                    </div>
                )}
            </PageElementWrapper>
            <QuestionDrawer
                question={drawer?.question}
                answer={drawer?.answer}
                index={drawer?.index}
                total={drawer?.total}
                onClose={() => setDrawer(null)}
                onSaved={() => setDrawer(null)}
                t={t}
            />
        </PageContentWrapper>
    );
};
