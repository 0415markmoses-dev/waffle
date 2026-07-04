import {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import TestersService from '../../Services/PrivateApi/TestersService.js';
import TestPlansService from '../../Services/PrivateApi/TestPlansService.js';
import {Button} from '../UI/Buttons/Button.jsx';

const S = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    ADDED: 'added',
    ERROR: 'error',
};

const StatusBadge = ({status, wasCreated, message}) => {
    const {t} = useTranslation();
    if (status === S.PENDING) {
        return <span className="badge bg-secondary">{t('Pending')}</span>;
    }
    if (status === S.PROCESSING) {
        return <span className="badge bg-info text-dark">{t('Processing…')}</span>;
    }
    if (status === S.ERROR) {
        return (
            <span className="badge bg-danger" title={message}>
                {t('Error')}
            </span>
        );
    }
    if (status === S.ADDED) {
        return (
            <span className="d-flex gap-1 align-items-center">
                {wasCreated && <span className="badge bg-primary">{t('Created')}</span>}
                <span className="badge bg-success">{t('Added')}</span>
            </span>
        );
    }
    return null;
};

export const BulkTestersAdd = ({
                                   testPlanId,
                                   onSuccessItem = () => {
                                   },
                                   onErrorItem = () => {
                                   },
                                   onEnd = () => {
                                   },
                                   onCancel = () => {
                                   },
                               }) => {
    const {t} = useTranslation();
    const [phase, setPhase] = useState('input'); // 'input' | 'processing' | 'done'
    const [textarea, setTextarea] = useState('');
    const [results, setResults] = useState([]);
    const running = useRef(false);

    const patchResult = (i, patch) =>
        setResults(prev => {
            const next = [...prev];
            next[i] = {...next[i], ...patch};
            return next;
        });

    const handleProceed = async () => {
        if (running.current) return;
        running.current = true;

        const emails = [
            ...new Set(
                textarea
                    .split(';')
                    .map(e => e.trim())
                    .filter(e => e.length > 0),
            ),
        ];

        if (emails.length === 0) {
            running.current = false;
            return;
        }

        setResults(emails.map(email => ({email, status: S.PENDING, wasCreated: false, message: ''})));
        setPhase('processing');

        // Fetch current enrolled IRIs so we can accumulate without refetching each time.
        let enrolledIris = [];
        try {
            const tp = await TestPlansService.getOne(testPlanId);
            enrolledIris = (tp.data.testersEnrolled ?? []).map(t =>
                typeof t === 'string' ? t : (t['@id'] ?? `/api/testers/${t.id}`),
            );
        } catch {
            // proceed with an empty list — worst case we re-add already enrolled ones
        }

        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            patchResult(i, {status: S.PROCESSING});

            try {
                // 1. Look up tester by email
                let tester = null;
                let wasCreated = false;

                const res = await TestersService.getTesters({email, itemsPerPage: 1, page: 1});
                const members = res.data['member'] ?? res.data['hydra:member'] ?? [];
                const found = members.find(t => t.email?.toLowerCase() === email.toLowerCase());

                if (found) {
                    tester = found;
                } else {
                    // 2. Create tester
                    const created = await TestersService.createTester({email});
                    tester = created.data;
                    wasCreated = true;
                }

                // 3. Enroll in test plan (skip if already there)
                const iri = tester['@id'] ?? `/api/testers/${tester.id}`;
                if (!enrolledIris.includes(iri)) {
                    enrolledIris = [...enrolledIris, iri];
                    await TestPlansService.updateTestPlan(testPlanId, {testersEnrolled: enrolledIris});
                }

                patchResult(i, {status: S.ADDED, wasCreated});
                onSuccessItem({email, tester, wasCreated});

            } catch (err) {
                const message =
                    err?.response?.data?.detail ??
                    err?.response?.data?.['hydra:description'] ??
                    'Unknown error';
                patchResult(i, {status: S.ERROR, message});
                onErrorItem({email, error: message});
            }
        }

        running.current = false;
        setPhase('done');
        onEnd();
    };

    // ── Input phase ──────────────────────────────────────────────────────────
    if (phase === 'input') {
        return (
            <>
                <p className="text-muted mb-2" style={{fontSize: '.875rem'}}>
                    {t('bulk_testers_hint')}
                </p>
                <textarea
                    className="form-control"
                    rows={6}
                    placeholder="alice@example.com; bob@example.com; carol@example.com"
                    value={textarea}
                    onChange={e => setTextarea(e.target.value)}
                    style={{resize: 'vertical', fontFamily: 'monospace', fontSize: '.85rem'}}
                    autoFocus
                />
                <div className="d-flex gap-2 justify-content-end mt-3">
                    <Button type="light" size="md" onClick={onCancel}>
                        {t('Cancel')}
                    </Button>
                    <Button
                        type="primary"
                        size="md"
                        disabled={!textarea.trim()}
                        onClick={handleProceed}
                    >
                        {t('Proceed')}
                    </Button>
                </div>
            </>
        );
    }

    // ── Processing / done phase ──────────────────────────────────────────────
    return (
        <>
            <div style={{maxHeight: '340px', overflowY: 'auto'}}>
                {results.map((r, i) => (
                    <div
                        key={i}
                        className="d-flex align-items-center justify-content-between py-2 border-bottom"
                        style={{fontSize: '.875rem'}}
                    >
                        <span
                            className="text-truncate me-3"
                            style={{maxWidth: '300px'}}
                            title={r.email}
                        >
                            {r.email}
                        </span>
                        <StatusBadge status={r.status} wasCreated={r.wasCreated} message={r.message}/>
                    </div>
                ))}
            </div>

            {phase === 'processing' && (
                <p className="text-muted text-center mt-3 mb-0" style={{fontSize: '.8rem'}}>
                    {t('Processing…')}
                </p>
            )}

            {phase === 'done' && (
                <div className="d-flex justify-content-end mt-3">
                    <Button type="primary" size="md" onClick={onCancel}>
                        {t('Close')}
                    </Button>
                </div>
            )}
        </>
    );
};

BulkTestersAdd.propTypes = {
    testPlanId: PropTypes.number.isRequired,
    onSuccessItem: PropTypes.func,
    onErrorItem: PropTypes.func,
    onEnd: PropTypes.func,
    onCancel: PropTypes.func,
};

StatusBadge.propTypes = {
    status: PropTypes.string,
    wasCreated: PropTypes.bool,
    message: PropTypes.string,
};
