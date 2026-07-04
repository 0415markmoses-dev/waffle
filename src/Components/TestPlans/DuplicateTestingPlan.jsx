import {useState, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router';
import classNames from 'classnames';
import toast from 'react-hot-toast';
import {useTestPlan} from '../../Hooks/queries/useTestPlansQuery.js';
import {useProjects} from '../../Hooks/queries/useProjectsQuery.js';
import {useReleases} from '../../Hooks/queries/useReleasesQuery.js';
import {useQuestions} from '../../Hooks/queries/useQuestionsQuery.js';
import TestPlansService from '../../Services/PrivateApi/TestPlansService.js';
import QuestionsService from '../../Services/PrivateApi/QuestionsService.js';
import {Button} from '../UI/Buttons/Button.jsx';
import {LocalDatetimeInput} from '../UI/Form/Inputs/LocalDatetimeInput.jsx';

const STEPS = [
    {number: 1, key: 'Introduction'},
    {number: 2, key: 'Select project'},
    {number: 3, key: 'Select release'},
    {number: 4, key: 'Select questions'},
    {number: 5, key: 'Name & due date'},
    {number: 6, key: 'Confirm'},
];

export const DuplicateTestingPlan = ({sourceTestPlanId, onCancel}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedRelease, setSelectedRelease] = useState(null);
    const [projectSearch, setProjectSearch] = useState('');
    const [releaseSearch, setReleaseSearch] = useState('');
    const [selectedQIds, setSelectedQIds] = useState(null);
    const [planName, setPlanName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [duplicating, setDuplicating] = useState(false);

    const {data: sourcePlan} = useTestPlan(sourceTestPlanId);
    const {data: projectsData} = useProjects();
    const projects = projectsData?.member ?? [];

    const {data: releases = []} = useReleases({project: selectedProject?.id});
    const {data: questions = []} = useQuestions({plan: `/api/test_plans/${sourceTestPlanId}`});

    // Pre-fill plan name from source when it loads
    useEffect(() => {
        if (sourcePlan?.name && !planName) {
            setPlanName(sourcePlan.name);
        }
    }, [sourcePlan?.name]);

    const orderedQuestions = useMemo(() => {
        if (!sourcePlan?.questionsOrder?.length) return questions;
        const orderMap = Object.fromEntries(
            sourcePlan.questionsOrder.map((iri, i) => [iri, i])
        );
        return [...questions].sort((a, b) => {
            const ai = orderMap[a['@id']] ?? 9999;
            const bi = orderMap[b['@id']] ?? 9999;
            return ai - bi;
        });
    }, [questions, sourcePlan?.questionsOrder]);

    // Select all questions by default when they load
    useEffect(() => {
        if (questions.length > 0 && selectedQIds === null) {
            setSelectedQIds(new Set(questions.map(q => q['@id'] ?? `/api/questions/${q.id}`)));
        }
    }, [questions, selectedQIds]);

    // Sorted newest → oldest by id
    const sortedProjects = useMemo(() =>
            [...projects].sort((a, b) => b.id - a.id),
        [projects]
    );

    const sortedReleases = useMemo(() =>
            [...releases].sort((a, b) => b.id - a.id),
        [releases]
    );

    const filteredProjects = sortedProjects.filter(p =>
        p.name.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const filteredReleases = sortedReleases.filter(r =>
        r.name.toLowerCase().includes(releaseSearch.toLowerCase())
    );

    const allSelected = selectedQIds !== null
        && orderedQuestions.length > 0
        && orderedQuestions.every(q => selectedQIds.has(q['@id'] ?? `/api/questions/${q.id}`));

    const toggleQuestion = (iri) => {
        setSelectedQIds(prev => {
            const next = new Set(prev);
            if (next.has(iri)) next.delete(iri); else next.add(iri);
            return next;
        });
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelectedQIds(new Set());
        } else {
            setSelectedQIds(new Set(orderedQuestions.map(q => q['@id'] ?? `/api/questions/${q.id}`)));
        }
    };

    const handleDuplicate = async () => {
        setDuplicating(true);
        try {
            const newPlanRes = await TestPlansService.createTestPlan({
                name: planName,
                description: sourcePlan.description ?? '',
                release: `/api/releases/${selectedRelease.id}`,
                state: 'draft',
                dueDate: dueDate,
            });
            const newPlan = newPlanRes.data;
            const newPlanIri = newPlan['@id'] ?? `/api/test_plans/${newPlan.id}`;
            const newPlanId = newPlan.id;

            const questionsToCreate = orderedQuestions.filter(q =>
                (selectedQIds ?? new Set()).has(q['@id'] ?? `/api/questions/${q.id}`)
            );

            const newQIris = [];
            for (const q of questionsToCreate) {
                const created = await QuestionsService.createQuestion({
                    name: q.name,
                    content: q.content ?? '',
                    plan: newPlanIri,
                });
                newQIris.push(created.data['@id'] ?? `/api/questions/${created.data.id}`);
            }

            if (newQIris.length > 0) {
                await TestPlansService.updateTestPlan(newPlanId, {questionsOrder: newQIris});
            }

            toast.success(t('dtp.success'));
            onCancel?.();
            navigate(`/app/project/testing_plans/${newPlanId}`);
        } catch (err) {
            toast.error(err?.response?.data?.detail ?? t('dtp.error'));
        } finally {
            setDuplicating(false);
        }
    };

    const selectedCount = selectedQIds?.size ?? 0;
    const canProceedStep5 = planName.trim() !== '' && dueDate !== '';

    const renderContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="dtp-step-content">
                        <h5 className="dtp-content-title">{t('Duplicate this testing plan')}</h5>
                        <p className="dtp-content-desc">{t('dtp.intro_desc')}</p>
                        <div className="dtp-footer">
                            <Button type="light" size="sm" onClick={onCancel}>{t('Cancel')}</Button>
                            <Button type="primary" size="sm" onClick={() => setStep(2)}>{t('Next')}</Button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="dtp-step-content">
                        <h5 className="dtp-content-title">{t('Select project')}</h5>
                        <p className="dtp-content-desc">{t('dtp.select_project_hint')}</p>
                        <input
                            className="form-control form-control-sm mb-2"
                            placeholder={t('Search projects…')}
                            value={projectSearch}
                            onChange={e => setProjectSearch(e.target.value)}
                        />
                        <div className="dtp-list">
                            {filteredProjects.length === 0 && (
                                <div className="dtp-list-empty">{t('No results found')}</div>
                            )}
                            {filteredProjects.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    className={classNames('dtp-list-item', {
                                        'dtp-list-item--active': selectedProject?.id === p.id,
                                    })}
                                    onClick={() => {
                                        setSelectedProject(p);
                                        setSelectedRelease(null);
                                    }}
                                >
                                    <span className="dtp-list-name">{p.name}</span>
                                    {selectedProject?.id === p.id && (
                                        <i className="font-icon lni lni-check-circle ms-auto"
                                           style={{color: 'var(--bs-success)', flexShrink: 0}}/>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="dtp-footer">
                            <Button type="light" size="sm" onClick={() => setStep(1)}>{t('Back')}</Button>
                            <Button type="primary" size="sm" disabled={!selectedProject}
                                    onClick={() => setStep(3)}>{t('Next')}</Button>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="dtp-step-content">
                        <h5 className="dtp-content-title">{t('Select release')}</h5>
                        <p className="dtp-content-desc">{t('dtp.select_release_hint')}</p>
                        <input
                            className="form-control form-control-sm mb-2"
                            placeholder={t('Search releases…')}
                            value={releaseSearch}
                            onChange={e => setReleaseSearch(e.target.value)}
                        />
                        <div className="dtp-list">
                            {filteredReleases.length === 0 && (
                                <div className="dtp-list-empty">{t('No results found')}</div>
                            )}
                            {filteredReleases.map(r => (
                                <button
                                    key={r.id}
                                    type="button"
                                    className={classNames('dtp-list-item', {
                                        'dtp-list-item--active': selectedRelease?.id === r.id,
                                    })}
                                    onClick={() => setSelectedRelease(r)}
                                >
                                    <span className="dtp-list-name">{r.name}</span>
                                    {selectedRelease?.id === r.id && (
                                        <i className="font-icon lni lni-check-circle ms-auto"
                                           style={{color: 'var(--bs-success)', flexShrink: 0}}/>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="dtp-footer">
                            <Button type="light" size="sm" onClick={() => setStep(2)}>{t('Back')}</Button>
                            <Button type="primary" size="sm" disabled={!selectedRelease}
                                    onClick={() => setStep(4)}>{t('Next')}</Button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="dtp-step-content">
                        <h5 className="dtp-content-title">{t('Select questions')}</h5>
                        <p className="dtp-content-desc">{t('dtp.select_questions_hint')}</p>
                        <div className="dtp-q-toggle mb-2">
                            <button type="button" className="btn btn-sm btn-light" onClick={toggleAll}>
                                {allSelected ? t('Deselect all') : t('Select all')}
                            </button>
                            <span className="dtp-q-count">{selectedCount}/{orderedQuestions.length}</span>
                        </div>
                        <div className="dtp-list">
                            {orderedQuestions.length === 0 && (
                                <div className="dtp-list-empty">{t('No questions found.')}</div>
                            )}
                            {orderedQuestions.map((q, idx) => {
                                const iri = q['@id'] ?? `/api/questions/${q.id}`;
                                const checked = selectedQIds?.has(iri) ?? false;
                                return (
                                    <button
                                        key={q.id}
                                        type="button"
                                        className={classNames('dtp-list-item dtp-list-item--question', {
                                            'dtp-list-item--active': checked,
                                        })}
                                        onClick={() => toggleQuestion(iri)}
                                    >
                                        <div className={classNames('dtp-checkbox', {'dtp-checkbox--checked': checked})}>
                                            {checked && <i className="font-icon lni lni-check"/>}
                                        </div>
                                        <div className="dtp-q-info">
                                            <span className="dtp-q-num">#{idx + 1}</span>
                                            <span className="dtp-q-name">{q.name}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="dtp-footer">
                            <Button type="light" size="sm" onClick={() => setStep(3)}>{t('Back')}</Button>
                            <Button type="primary" size="sm" disabled={selectedCount === 0}
                                    onClick={() => setStep(5)}>{t('Next')}</Button>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="dtp-step-content">
                        <h5 className="dtp-content-title">{t('Name & due date')}</h5>
                        <p className="dtp-content-desc">{t('dtp.name_hint')}</p>
                        <div className="dtp-field-group">
                            <label className="dtp-field-label">{t('Test Plan Name')}</label>
                            <input
                                className="form-control"
                                value={planName}
                                onChange={e => setPlanName(e.target.value)}
                                placeholder={t('Test Plan Name')}
                            />
                        </div>
                        <div className="dtp-field-group">
                            <label className="dtp-field-label">
                                {t('Test Plan Deadline')}
                                <span className="dtp-required">*</span>
                            </label>
                            <LocalDatetimeInput value={dueDate} onChange={setDueDate}/>
                        </div>
                        <div className="dtp-footer">
                            <Button type="light" size="sm" onClick={() => setStep(4)}>{t('Back')}</Button>
                            <Button type="primary" size="sm" disabled={!canProceedStep5}
                                    onClick={() => setStep(6)}>{t('Next')}</Button>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="dtp-step-content">
                        <h5 className="dtp-content-title">{t('Confirm')}</h5>
                        <div className="dtp-confirm-block">
                            <p>{t('dtp.confirm_plan', {
                                name: planName,
                                release: selectedRelease?.name,
                                project: selectedProject?.name,
                            })}</p>
                            <p className="text-muted">{t('dtp.confirm_questions', {count: selectedCount})}</p>
                        </div>
                        <div className="dtp-footer">
                            <Button type="light" size="sm" onClick={() => setStep(5)}>{t('Back')}</Button>
                            <Button type="primary" size="sm" loading={duplicating} onClick={handleDuplicate}>
                                {duplicating ? t('dtp.duplicating') : t('dtp.confirm_btn')}
                            </Button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="dtp-layout">
            <div className="dtp-sidebar">
                {STEPS.map(s => (
                    <button
                        key={s.number}
                        type="button"
                        className={classNames('dtp-sidebar-step', {
                            'dtp-sidebar-step--active': step === s.number,
                            'dtp-sidebar-step--done': step > s.number,
                        })}
                        onClick={() => {
                            if (step > s.number) setStep(s.number);
                        }}
                        style={{cursor: step > s.number ? 'pointer' : 'default'}}
                    >
                        <div className="dtp-step-num">
                            {step > s.number
                                ? <i className="font-icon lni lni-check"/>
                                : s.number
                            }
                        </div>
                        <span className="dtp-step-lbl">{t(s.key)}</span>
                    </button>
                ))}
            </div>
            <div className="dtp-content">
                {renderContent()}
            </div>
        </div>
    );
};
