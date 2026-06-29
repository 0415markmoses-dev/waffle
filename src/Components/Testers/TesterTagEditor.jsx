import {useEffect, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import {useDebounce} from '../../Hooks/useDebounce.js';
import {useUpdateTester} from '../../Hooks/queries/useTestersQuery.js';
import TesterTagsService from '../../Services/PrivateApi/TesterTagsService.js';

// ── TesterTagEditor ───────────────────────────────────────────────────────────

export const TesterTagEditor = ({tags = [], testerId, editable = true, className = ''}) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [focusedIdx, setFocusedIdx] = useState(0);
    const inputRef = useRef(null);
    const debouncedQuery = useDebounce(query, 300);
    const updateTester = useUpdateTester();

    useEffect(() => {
        if (open) {
            setQuery('');
            setFocusedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const searchEnabled = debouncedQuery.trim().length >= 1;

    const {data: rawSuggestions = [], isFetching} = useQuery({
        queryKey: ['tester-tags', debouncedQuery],
        queryFn: () =>
            TesterTagsService.getTags({label: debouncedQuery}).then(r =>
                r.data['member'] ?? []
            ),
        enabled: searchEnabled,
        staleTime: 30_000,
    });

    // Filter during render so we always use the fresh `tags` prop, not a stale closure
    const suggestions = rawSuggestions
        .filter(tag => !tag.deleted && !tags.includes(tag.label))
        .slice(0, 5);

    const showCreate =
        query.trim().length > 0 &&
        !suggestions.some(s => s.label.toLowerCase() === query.trim().toLowerCase()) &&
        !tags.includes(query.trim());

    const totalItems = suggestions.length + (showCreate ? 1 : 0);

    useEffect(() => {
        setFocusedIdx(0);
    }, [suggestions]);

    const patchTags = (newTags) => {
        updateTester.mutate(
            {id: testerId, data: {tags: newTags}},
            {
                onSuccess: () => toast.success(t('Tags updated.')),
                onError: () => toast.error(t('Failed to update tags.')),
            }
        );
    };

    const addTag = (label) => {
        if (tags.includes(label)) return;
        patchTags([...tags, label]);
        setOpen(false);
        setQuery('');
    };

    const removeTag = (label) => {
        patchTags(tags.filter(tag => tag !== label));
    };

    const handleCreate = async () => {
        const label = query.trim();
        if (!label) return;
        try {
            await TesterTagsService.createTag({label});
            addTag(label);
        } catch {
            toast.error(t('Failed to create tag.'));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setOpen(false);
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIdx(i => Math.min(i + 1, totalItems - 1));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIdx(i => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIdx < suggestions.length && suggestions[focusedIdx]) {
                addTag(suggestions[focusedIdx].label);
            } else if (showCreate && focusedIdx === suggestions.length) {
                handleCreate();
            }
        }
    };

    const showDropdown = open && searchEnabled && totalItems > 0;

    return (
        <div className={`tte-root${className ? ` ${className}` : ''}`}>

            {/* Badges row */}
            <div className="tte-badges">
                {tags.map(label => (
                    <span key={label} className="tte-badge">
                        <i className="font-icon lni lni-tag-1 tte-badge-icon"/>
                        {label}
                        {editable && (
                            <button
                                className="tte-badge-remove"
                                onMouseDown={e => {
                                    e.preventDefault();
                                    removeTag(label);
                                }}
                                disabled={updateTester.isPending}
                                title={t('Remove tag')}
                            >
                                <i className="font-icon lni lni-xmark"/>
                            </button>
                        )}
                    </span>
                ))}
                {editable && (
                    <button
                        className="tte-badge tte-badge--add"
                        onClick={() => setOpen(o => !o)}
                        title={t('Add tag')}
                    >
                        <i className="font-icon lni lni-plus"/>
                        {t('Add…')}
                    </button>
                )}
            </div>

            {/* Expandable input + dropdown */}
            {editable && open && (
                <div className="tte-input-wrap">
                    <i className={`font-icon lni ${isFetching ? 'lni-spinner-3 lni-is-spinning' : 'lni-search-1'} tte-input-icon`}/>
                    <input
                        ref={inputRef}
                        className="tte-input"
                        type="text"
                        placeholder={t('Search or create tag…')}
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value);
                            setFocusedIdx(0);
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={updateTester.isPending}
                    />
                    {showDropdown && (
                        <div className="tte-dropdown">
                            {suggestions.map((tag, i) => (
                                <button
                                    key={tag.id ?? tag.label}
                                    className={`search-result-item${i === focusedIdx ? ' is-focused' : ''}`}
                                    onMouseDown={() => addTag(tag.label)}
                                    onMouseEnter={() => setFocusedIdx(i)}
                                >
                                    <span className="search-result-body">
                                        <span className="search-result-name">{tag.label}</span>
                                    </span>
                                </button>
                            ))}
                            {showCreate && (
                                <button
                                    className={`search-result-item tte-create-item${focusedIdx === suggestions.length ? ' is-focused' : ''}`}
                                    onMouseDown={handleCreate}
                                    onMouseEnter={() => setFocusedIdx(suggestions.length)}
                                >
                                    <span className="search-result-icon-wrap tte-create-icon">
                                        <i className="font-icon lni lni-plus"/>
                                    </span>
                                    <span className="search-result-body">
                                        <span className="search-result-name">
                                            {t('Create tag')} &ldquo;{query.trim()}&rdquo;
                                        </span>
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

TesterTagEditor.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string),
    testerId: PropTypes.string,
    editable: PropTypes.bool,
    className: PropTypes.string,
};
