import Modal from 'react-modal';
import {ModalHeader} from "../UI/ReactModal/ModalHeader.jsx";
import {ModalBody} from "../UI/ReactModal/ModalBody.jsx";
import {ModalFooter} from "../UI/ReactModal/ModalFooter.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import PropTypes from "prop-types";
import {useState} from "react";
import {useCreateTestPlan} from "../../Hooks/queries/useTestPlansQuery.js";
import {useReleases} from "../../Hooks/queries/useReleasesQuery.js";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {FormGroupWrapper} from "../UI/Form/FormGroupWrapper.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {LocalDatetimeInput} from "../UI/Form/Inputs/LocalDatetimeInput.jsx";
import toast from "react-hot-toast";
import {useNavigate} from "react-router";

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '440px',
        maxWidth: '560px',
        width: '100%',
    },
};

// ── Modal (controlled) ────────────────────────────────────────────────────────

export const ModalCreateTestPlan = ({
                                        isVisible = false,
                                        release = undefined,  // if provided, the release picker is hidden
                                        onCancel = () => {
                                        },
                                    }) => {
    const navigate = useNavigate();
    const {currentProjectId} = useProjectStore();
    const [name, setName] = useState('');
    const [selectedReleaseId, setSelectedReleaseId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const createTestPlan = useCreateTestPlan();

    // Only fetch releases when no release is pre-set
    const {data: releases = [], isLoading: releasesLoading} = useReleases(
        release ? {} : {project: currentProjectId}
    );

    const activeRelease = release ?? releases.find(r => String(r.id) === String(selectedReleaseId));

    const handleCancel = () => {
        if (createTestPlan.isPending) return;
        setName('');
        setSelectedReleaseId('');
        setDueDate('');
        onCancel();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !activeRelease?.id) return;

        createTestPlan.mutate(
            {
                name: name.trim(),
                description: '',
                content: '',
                release: `/api/releases/${activeRelease.id}`,
                dueDate: dueDate || null,
            },
            {
                onSuccess: (data) => {
                    setName('');
                    setSelectedReleaseId('');
                    setDueDate('');
                    navigate(`/app/project/testing_plans/${data.id}`);
                },
                onError: (err) => {
                    const detail =
                        err?.response?.data?.detail ??
                        err?.response?.data?.['hydra:description'] ??
                        'Failed to create testing plan.';
                    toast.error(detail);
                },
            }
        );
    };

    const disabled = createTestPlan.isPending;
    const canSubmit = name.trim() && activeRelease?.id && dueDate && !disabled;

    return (
        <Modal style={customStyles} isOpen={isVisible} onRequestClose={handleCancel}>
            <ModalHeader
                title="New testing plan"
                subtitle={activeRelease?.name ? `For release ${activeRelease.name}` : undefined}
            />
            <form onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroupWrapper>
                        <FormGroup>
                            <FormGroupLabel>Name <span className="text-danger">*</span></FormGroupLabel>
                            <TextInput
                                placeholder="e.g. Regression — Sprint 42"
                                value={name}
                                onChange={setName}
                                disabled={disabled}
                                required
                            />
                        </FormGroup>

                        {!release && (
                            <FormGroup>
                                <FormGroupLabel>Release <span className="text-danger">*</span></FormGroupLabel>
                                <select
                                    className="form-select"
                                    value={selectedReleaseId}
                                    onChange={e => setSelectedReleaseId(e.target.value)}
                                    disabled={disabled || releasesLoading}
                                    required
                                >
                                    <option value="">— Select a release —</option>
                                    {releases.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </FormGroup>
                        )}

                        <FormGroup>
                            <FormGroupLabel>Due date <span className="text-danger">*</span></FormGroupLabel>
                            <LocalDatetimeInput
                                value={dueDate}
                                onChange={setDueDate}
                                disabled={disabled}
                                required
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </ModalBody>
                <ModalFooter>
                    <div className="d-flex gap-sm justify-content-end w-100 pt-md">
                        <Button type="light" size="md" onClick={handleCancel} disabled={disabled}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            size="md"
                            disabled={!canSubmit}
                            loading={disabled}
                        >
                            {disabled ? 'Creating…' : 'Create'}
                        </Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
};

ModalCreateTestPlan.propTypes = {
    isVisible: PropTypes.bool,
    release: PropTypes.object,
    onCancel: PropTypes.func,
};

// ── Self-contained trigger + modal ────────────────────────────────────────────
// Drop <CreateTestPlanButton /> anywhere.
// Pass release={releaseData} to skip the release picker.

export const CreateTestPlanButton = ({release = undefined, children}) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button icon="lni-plus" type="primary" size="sm" onClick={() => setOpen(true)}>
                {children ?? 'New testing plan'}
            </Button>
            <ModalCreateTestPlan
                isVisible={open}
                release={release}
                onCancel={() => setOpen(false)}
            />
        </>
    );
};

CreateTestPlanButton.propTypes = {
    release: PropTypes.object,
    children: PropTypes.node,
};
