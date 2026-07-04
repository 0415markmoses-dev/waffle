import {useState, useEffect, useRef, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {useTranslation} from 'react-i18next';
import SearchService from '../../Services/PrivateApi/SearchService.js';
import {useDebounce} from '../../Hooks/useDebounce.js';

// ── Type metadata ─────────────────────────────────────────────────────────────

const TYPE_META = {
    projects: {icon: 'lni-folder-1', labelKey: 'Project'},
    testers: {icon: 'lni-user-4', labelKey: 'Tester'},
    test_plan: {icon: 'lni-clipboard', labelKey: 'Testing Plan'},
    questions: {icon: 'lni-file-question', labelKey: 'Question'},
    answers: {icon: 'lni-check-circle-1', labelKey: 'Answer'},
};

const iriToPath = (type, iri) => {
    const id = iri?.split('/').pop();
    switch (type) {
        case 'projects':
            return `/app/project-settings`;
        case 'testers':
            return `/app/project/testers/${id}`;
        case 'test_plan':
            return `/app/project/testing_plans/${id}`;
        case 'questions':
            return `/app/project/questions/${id}`;
        case 'answers':
            return `/app/project/answers/${id}`;
        default:
            return null;
    }
};

// ── SearchModal ───────────────────────────────────────────────────────────────

export const SearchModal = ({isOpen, onClose}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [focusedIdx, setFocusedIdx] = useState(0);
    const debouncedQuery = useDebounce(query, 300);

    const {data: results = [], isFetching} = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: () => SearchService.search(debouncedQuery).then(r => r.data),
        enabled: debouncedQuery.trim().length >= 2,
        staleTime: 30_000,
    });

    // Focus input & reset when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setFocusedIdx(0);
            const t = setTimeout(() => inputRef.current?.focus(), 40);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Reset focused item when results change
    useEffect(() => {
        setFocusedIdx(0);
    }, [results]);

    const handleSelect = useCallback((result) => {
        const path = iriToPath(result.type, result.iri);
        if (path) navigate(path);
        onClose();
    }, [navigate, onClose]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIdx(i => Math.min(i + 1, results.length - 1));
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIdx(i => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter' && results[focusedIdx]) {
            handleSelect(results[focusedIdx]);
        }
    };

    if (!isOpen) return null;

    const hasQuery = debouncedQuery.trim().length >= 2;
    const showEmpty = hasQuery && !isFetching && results.length === 0;

    return (
        <div className="search-overlay" onMouseDown={onClose}>
            <div className="search-modal" onMouseDown={e => e.stopPropagation()}>

                {/* ── Input row ── */}
                <div className="search-modal-input-row">
                    <i className={`font-icon lni ${isFetching ? 'lni-spinner-3 lni-is-spinning' : 'lni-search-1'} search-modal-icon`}/>
                    <input
                        ref={inputRef}
                        className="search-modal-input"
                        type="text"
                        placeholder={t('Search anything…')}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {query && (
                        <button
                            className="search-modal-clear"
                            onMouseDown={e => {
                                e.preventDefault();
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                        >
                            <i className="font-icon lni lni-xmark"/>
                        </button>
                    )}
                    <kbd className="search-modal-esc" onMouseDown={e => {
                        e.preventDefault();
                        onClose();
                    }}>Esc</kbd>
                </div>

                {/* ── Results ── */}
                {hasQuery && results.length > 0 && (
                    <div className="search-modal-results">
                        {results.map((r, i) => {
                            const meta = TYPE_META[r.type] ?? {icon: 'lni-search-1', labelKey: r.type};
                            return (
                                <button
                                    key={r.iri}
                                    className={`search-result-item${i === focusedIdx ? ' is-focused' : ''}`}
                                    onMouseDown={() => handleSelect(r)}
                                    onMouseEnter={() => setFocusedIdx(i)}
                                >
                                    <span className="search-result-icon-wrap">
                                        <i className={`font-icon lni ${meta.icon}`}/>
                                    </span>
                                    <span className="search-result-body">
                                        <span className="search-result-name">{r.name}</span>
                                        {r.extracts?.[0] && (
                                            <span className="search-result-extract">{r.extracts[0]}</span>
                                        )}
                                    </span>
                                    <span className="search-result-type">{t(meta.labelKey)}</span>
                                    <i className="font-icon lni lni-arrow-right search-result-arrow"/>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Empty state ── */}
                {showEmpty && (
                    <div className="search-modal-empty">
                        <i className="font-icon lni lni-search-1"/>
                        <span>{t('No results found')}</span>
                    </div>
                )}

                {/* ── Idle hint ── */}
                {!hasQuery && !isFetching && (
                    <div className="search-modal-hint">
                        <span>{t('Type at least 2 characters to search…')}</span>
                    </div>
                )}

            </div>
        </div>
    );
};
