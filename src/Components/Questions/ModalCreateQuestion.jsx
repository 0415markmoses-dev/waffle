import Modal from 'react-modal';
import {useState} from 'react';
import {useNavigate} from 'react-router';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {ModalFooter} from '../UI/ReactModal/ModalFooter.jsx';
import {Button} from '../UI/Buttons/Button.jsx';
import {FormGroup} from '../UI/Form/FormGroup.jsx';
import {FormGroupLabel} from '../UI/Form/FormGroupLabel.jsx';
import {FormGroupWrapper} from '../UI/Form/FormGroupWrapper.jsx';
import {TextInput} from '../UI/Form/Inputs/TextInput.jsx';
import {useCreateQuestion} from '../../Hooks/queries/useQuestionsQuery.js';

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

export const ModalCreateQuestion = ({
                                        isVisible = false, testPlan, onCancel = () => {
    }
                                    }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const createQuestion = useCreateQuestion();

    const handleCancel = () => {
        if (createQuestion.isPending) return;
        setName('');
        onCancel();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        createQuestion.mutate(
            {
                name: name.trim(),
                content: '',
                plan: typeof testPlan === 'object' ? testPlan['@id'] ?? `/api/test_plans/${testPlan.id}` : testPlan,
            },
            {
                onSuccess: (data) => {
                    setName('');
                    navigate(`/app/project/questions/${data.id}`);
                },
                onError: (err) => {
                    const detail =
                        err?.response?.data?.detail ??
                        err?.response?.data?.['hydra:description'] ??
                        'Failed to create question.';
                    toast.error(detail);
                    // Modal stays open so the user can fix and retry
                },
            }
        );
    };

    const disabled = createQuestion.isPending;

    return (
        <Modal style={customStyles} isOpen={isVisible} onRequestClose={handleCancel}>
            <ModalHeader title="New question" subtitle={typeof testPlan === 'object' ? testPlan.name : undefined}/>
            <form onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroupWrapper>
                        <FormGroup>
                            <FormGroupLabel>Name <span className="text-danger">*</span></FormGroupLabel>
                            <TextInput
                                placeholder="e.g. UI-01: Login flow"
                                value={name}
                                onChange={setName}
                                disabled={disabled}
                                autoFocus
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
                            disabled={!name.trim() || disabled}
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

ModalCreateQuestion.propTypes = {
    isVisible: PropTypes.bool,
    testPlan: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    onCancel: PropTypes.func,
};
