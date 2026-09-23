import Modal from 'react-modal';
import PropTypes from 'prop-types';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {ModalFooter} from '../UI/ReactModal/ModalFooter.jsx';
import {Button} from '../UI/Buttons/Button.jsx';
import {FormGroup} from '../UI/Form/FormGroup.jsx';
import {FormGroupLabel} from '../UI/Form/FormGroupLabel.jsx';
import {TextInput} from '../UI/Form/Inputs/TextInput.jsx';
import {useCreateProject} from '../../Hooks/queries/useProjectsQuery.js';

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
        maxHeight: '80vh',
    },
};

export const ModalCreateProject = ({
                                       isVisible = false,
                                       onCancel = () => {
                                       },
                                       onCreated = () => {
                                       },
                                   }) => {
    const {t} = useTranslation();
    const [name, setName] = useState('');
    const createProject = useCreateProject();

    useEffect(() => {
        if (isVisible) {
            setName('');
        }
    }, [isVisible]);

    const handleCreate = () => {
        if (!name.trim()) return;
        createProject.mutate(
            {name: name.trim(), description: ''},
            {
                onSuccess: (data) => {
                    toast.success(t('Project created successfully.'));
                    onCreated(data);
                },
                onError: (err) => {
                    const detail = err?.response?.data?.detail
                        ?? err?.response?.data?.['hydra:description']
                        ?? err?.response?.data?.message
                        ?? t('Failed to create project.');
                    toast.error(detail);
                },
            }
        );
    };

    return (
        <Modal style={customStyles} isOpen={isVisible} onRequestClose={onCancel}>
            <ModalHeader
                title={t('Create a new project')}
                subtitle={t('Give your project a name — you can add more details later.')}
            />
            <ModalBody>
                <FormGroup>
                    <FormGroupLabel>{t('Project name')}</FormGroupLabel>
                    <TextInput
                        onChange={value => setName(value)}
                        disabled={createProject.isPending}
                        type="text"
                        placeholder={t('My awesome project')}
                        value={name}
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button loading={createProject.isPending} onClick={onCancel} type="light">
                    {t('Cancel')}
                </Button>
                <Button
                    disabled={!name.trim()}
                    loading={createProject.isPending}
                    onClick={handleCreate}
                    icon="lni-check"
                    type="primary"
                >
                    {t('Create')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ModalCreateProject.propTypes = {
    isVisible: PropTypes.bool,
    onCancel: PropTypes.func,
    onCreated: PropTypes.func,
};
