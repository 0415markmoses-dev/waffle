import Modal from 'react-modal';
import {useState, useEffect} from 'react';
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
import {useUpdateTestPlan} from '../../Hooks/queries/useTestPlansQuery.js';
import {useTesters} from '../../Hooks/queries/useTestersQuery.js';
import {useProjectStore} from '../../Store/PrivateData/ProjectsStore.js';

Modal.setAppElement('#root');

const DEBOUNCE_MS = 350;

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

export const ModalAddTester = ({
                                   isVisible = false, testPlan, onCancel = () => {
    }, onSuccess = () => {
    }
                               }) => {
    const [email, setEmail] = useState('');
    const [debouncedEmail, setDebounced] = useState('');
    const [selected, setSelected] = useState(null);
    const {currentProject} = useProjectStore();
    const updateTestPlan = useUpdateTestPlan();

    // Debounce
    useEffect(() => {
        const t = setTimeout(() => setDebounced(email), DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [email]);

    // Reset on close
    useEffect(() => {
        if (!isVisible) {
            setEmail('');
            setDebounced('');
            setSelected(null);
        }
    }, [isVisible]);

    const searchEnabled = debouncedEmail.length >= 2 && !selected;
    const {data: searchResults = [], isFetching} = useTesters(
        searchEnabled ? {project: currentProject?.id, email: debouncedEmail} : {project: null}
    );

    // Build autocomplete list for TextInput
    const autocompleteList = searchResults.map(t => ({
        value: t,
        label: (
            <div>
                <div style={{fontWeight: 500}}>{t.email}</div>
                {(t.firstName || t.lastName) && (
                    <div style={{fontSize: '.75rem', color: '#9ca3af'}}>
                        {[t.firstName, t.lastName].filter(Boolean).join(' ')}
                    </div>
                )}
            </div>
        ),
    }));

    const handleChange = (val) => {
        setEmail(val);
        setSelected(null);
    };

    const handleSelect = ({value: tester}) => {
        setSelected(tester);
        setEmail(tester.email);
    };

    const handleCancel = () => {
        if (updateTestPlan.isPending) return;
        onCancel();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selected) {
            toast.error('Please select a tester from the search results.');
            return;
        }

        const existing = (testPlan.testersEnrolled ?? []).map(t =>
            typeof t === 'string' ? t : t['@id'] ?? `/api/testers/${t.id}`
        );
        const newIri = selected['@id'] ?? `/api/testers/${selected.id}`;

        if (existing.includes(newIri)) {
            toast.error('This tester is already enrolled in this plan.');
            return;
        }

        updateTestPlan.mutate(
            {id: testPlan.id, data: {testersEnrolled: [...existing, newIri]}},
            {
                onSuccess: () => onSuccess(),
                onError: (err) => {
                    const detail =
                        err?.response?.data?.detail ??
                        err?.response?.data?.['hydra:description'] ??
                        'Failed to add tester.';
                    toast.error(detail);
                },
            }
        );
    };

    const disabled = updateTestPlan.isPending;

    return (
        <Modal style={customStyles} isOpen={isVisible} onRequestClose={handleCancel}>
            <ModalHeader title="Add tester" subtitle={testPlan?.name}/>
            <form onSubmit={handleSubmit}>
                <ModalBody>
                    <FormGroupWrapper>
                        <FormGroup>
                            <FormGroupLabel>
                                Search by email <span className="text-danger">*</span>
                            </FormGroupLabel>
                            <TextInput
                                placeholder="tester@example.com"
                                value={email}
                                onChange={handleChange}
                                disabled={disabled}
                                autoFocus
                                autoComplete="off"
                                leftIcon={isFetching ? 'lni-spinner-solid' : 'lni-search-1'}
                                clearable={!!email && !selected}
                                hasAutocomplete={searchEnabled && !isFetching}
                                autocompleteList={autocompleteList}
                                onSelectAutocompleteItem={handleSelect}
                                maxAutocompleteItemsDisplay={6}
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
                            disabled={!selected || disabled}
                            loading={disabled}
                        >
                            {disabled ? 'Adding…' : 'Add'}
                        </Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
};

ModalAddTester.propTypes = {
    isVisible: PropTypes.bool,
    testPlan: PropTypes.object,
    onCancel: PropTypes.func,
    onSuccess: PropTypes.func,
};
