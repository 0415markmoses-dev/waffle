import {useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {useAuthStore} from '../../Store/auth.js';
import {
    useAnnotations,
    useCreateAnnotation,
    useUpdateAnnotation,
    useDeleteAnnotation,
} from '../../Hooks/queries/useAnnotationsQuery.js';
import {usePublicProfile} from '../../Hooks/queries/usePublicProfileQuery.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const initials = (name = '') => {
    const str = typeof name === 'string' ? name : '';
    const parts = str.split(/[\s@._-]+/).filter(Boolean);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
};

const relativeTime = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'});
};

/** Extract the UUID from an IRI string or plain UUID. */
const extractId = (iriOrObj) => {
    if (!iriOrObj) return null;
    if (typeof iriOrObj === 'string') return iriOrObj.split('/').pop();
    return iriOrObj?.id ?? iriOrObj?.['@id']?.split('/').pop() ?? null;
};

// ── AnnAvatar ─────────────────────────────────────────────────────────────────

const AnnAvatar = ({profile, fallbackName}) => {
    if (profile?.profilePictureUrl) {
        return (
            <div className="ann-avatar ann-avatar--img">
                <img src={profile.profilePictureUrl} alt={profile.nickname ?? fallbackName ?? '?'}/>
            </div>
        );
    }
    return (
        <div className="ann-avatar">
            {initials(profile?.nickname ?? fallbackName ?? '')}
        </div>
    );
};

// ── AnnotationDisplay ─────────────────────────────────────────────────────────

export const AnnotationDisplay = ({annotation, currentUserId, isAdmin}) => {
    const {t} = useTranslation();
    const updateAnnotation = useUpdateAnnotation();
    const deleteAnnotation = useDeleteAnnotation();

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(annotation.content ?? '');

    const authorId = extractId(annotation.createdBy);
    const isCurrentUser = String(authorId) === String(currentUserId);
    const canEdit = isAdmin || isCurrentUser;
    const annotationId = annotation.id ?? annotation['@id']?.split('/').pop();

    const {data: profile} = usePublicProfile(authorId);
    const displayName = profile?.nickname ?? `#${authorId?.slice(0, 8) ?? '?'}`;

    const handleSave = () => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        updateAnnotation.mutate(
            {id: annotationId, data: {content: trimmed}},
            {
                onSuccess: () => {
                    toast.success(t('Annotation updated.'));
                    setEditing(false);
                },
                onError: () => toast.error(t('Failed to update annotation.')),
            }
        );
    };

    const handleDelete = () => {
        if (!window.confirm(t('Delete this annotation?'))) return;
        deleteAnnotation.mutate(annotationId, {
            onSuccess: () => toast.success(t('Annotation deleted.')),
            onError: () => toast.error(t('Failed to delete annotation.')),
        });
    };

    return (
        <div className="ann-item">
            <AnnAvatar profile={profile} fallbackName={displayName}/>
            <div className="ann-bubble-wrap">
                {editing ? (
                    <div className="ann-bubble ann-bubble--editing">
                        <textarea
                            className="ann-edit-textarea"
                            rows={3}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            disabled={updateAnnotation.isPending}
                            autoFocus
                        />
                        <div className="ann-edit-actions">
                            <button
                                className="btn btn-sm btn-light py-0 px-2"
                                onClick={() => {
                                    setEditing(false);
                                    setDraft(annotation.content);
                                }}
                                disabled={updateAnnotation.isPending}
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                className="btn btn-sm btn-primary py-0 px-2"
                                onClick={handleSave}
                                disabled={!draft.trim() || updateAnnotation.isPending}
                            >
                                {t('Save')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="ann-bubble">{annotation.content}</div>
                )}

                <div className="ann-meta">
                    <span className="ann-author">{displayName}</span>
                    <span>·</span>
                    <span title={annotation.created}>{relativeTime(annotation.created)}</span>
                    {canEdit && !editing && (
                        <span className="ann-actions">
                            <button
                                className="ann-action-btn"
                                title={t('Edit')}
                                onClick={() => setEditing(true)}
                            >
                                <i className="font-icon lni lni-pencil-1"/>
                            </button>
                            <button
                                className="ann-action-btn ann-action-btn--danger"
                                title={t('Delete')}
                                onClick={handleDelete}
                                disabled={deleteAnnotation.isPending}
                            >
                                <i className="font-icon lni lni-trash-3"/>
                            </button>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── TesterAnnotations ─────────────────────────────────────────────────────────

export const TesterAnnotations = ({testerIri}) => {
    const {t} = useTranslation();
    const {user} = useAuthStore();
    const textareaRef = useRef(null);
    const [content, setContent] = useState('');

    const {data: annotations = [], isLoading} = useAnnotations(testerIri);
    const createAnnotation = useCreateAnnotation();

    const currentUserId = user?.id;
    const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
    const currentUserIri = user?.['@id'] ?? (user?.id ? `/api/users/${user.id}` : null);

    // Current user's public profile (for the composer avatar)
    const {data: currentProfile} = usePublicProfile(currentUserId);

    const handleSubmit = () => {
        const trimmed = content.trim();
        if (!trimmed || !currentUserIri) return;

        createAnnotation.mutate(
            {relateTo: testerIri, content: trimmed, createdBy: currentUserIri},
            {
                onSuccess: () => {
                    setContent('');
                    if (textareaRef.current) textareaRef.current.style.height = 'auto';
                },
                onError: () => toast.error(t('Failed to add annotation.')),
            }
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInput = (e) => {
        setContent(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    };

    return (
        <div>
            {/* Feed */}
            {isLoading ? (
                <div className="ann-empty">
                    <div className="spinner-border spinner-border-sm text-secondary"/>
                </div>
            ) : annotations.length === 0 ? (
                <div className="ann-empty">{t('No annotations yet.')}</div>
            ) : (
                <div className="ann-feed">
                    {annotations.map(ann => (
                        <AnnotationDisplay
                            key={ann.id ?? ann['@id']}
                            annotation={ann}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            <hr className="ann-divider"/>

            {/* Composer */}
            <div className="ann-composer">
                <AnnAvatar profile={currentProfile} fallbackName={user?.nickname ?? user?.email}/>
                <textarea
                    ref={textareaRef}
                    className="ann-composer-input"
                    placeholder={t('Add an annotation… (Enter to send)')}
                    value={content}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={createAnnotation.isPending}
                />
                <button
                    className="ann-send-btn"
                    onClick={handleSubmit}
                    disabled={!content.trim() || createAnnotation.isPending}
                    title={t('Send')}
                >
                    <i className="font-icon lni lni-arrow-upward"/>
                </button>
            </div>
        </div>
    );
};
