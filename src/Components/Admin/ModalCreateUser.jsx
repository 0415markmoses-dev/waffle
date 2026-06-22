import Modal from 'react-modal';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {ModalFooter} from '../UI/ReactModal/ModalFooter.jsx';
import {Button} from '../UI/Buttons/Button.jsx';
import {FormGroup} from '../UI/Form/FormGroup.jsx';
import {FormGroupLabel} from '../UI/Form/FormGroupLabel.jsx';
import {TextInput} from '../UI/Form/Inputs/TextInput.jsx';
import {useCreateUser} from '../../Hooks/queries/useUsersQuery.js';

Modal.setAppElement('#root');

const modalStyles = {
    overlay: {zIndex: 1060, background: 'rgba(0,0,0,.45)'},
    content: {
        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
        marginRight: '-50%', transform: 'translate(-50%, -50%)',
        padding: 0, border: 'none', borderRadius: '12px',
        width: '100%', minWidth: '440px', maxWidth: '520px',
        maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
    },
};

const PAD = '1.25rem';

export const ModalCreateUser = ({isOpen, onClose, onCreated}) => {
    const {t} = useTranslation();
    const createUser = useCreateUser();

    const [form, setForm] = useState({email: '', plainPassword: '', active: true});

    const set = (key, value) => setForm(prev => ({...prev, [key]: value}));

    const handleSubmit = () => {
        if (!form.email || !form.plainPassword) {
            toast.error(t('Email and password are required.'));
            return;
        }
        createUser.mutate(
            {email: form.email, plainPassword: form.plainPassword, active: form.active, type: 'dev'},
            {
                onSuccess: (user) => {
                    toast.success(t('User created.'));
                    setForm({email: '', plainPassword: '', active: true});
                    onCreated?.(user);
                    onClose?.();
                },
                onError: () => toast.error(t('Failed to create user.')),
            }
        );
    };

    return (
        <Modal style={modalStyles} isOpen={isOpen} onRequestClose={onClose}>
            <div style={{padding: PAD, paddingBottom: 0}}>
                <ModalHeader title={t('Add new user')} subtitle={t('Create a new team member account.')}/>
            </div>

            <ModalBody>
                <div style={{padding: PAD, paddingBottom: 0}} className="d-flex flex-column gap-md">
                    <FormGroup>
                        <FormGroupLabel>{t('Email')}</FormGroupLabel>
                        <TextInput
                            type="email"
                            placeholder="user@example.com"
                            value={form.email}
                            onChange={v => set('email', v)}
                            disabled={createUser.isPending}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormGroupLabel>{t('Password')}</FormGroupLabel>
                        <TextInput
                            type="password"
                            placeholder="••••••••"
                            value={form.plainPassword}
                            onChange={v => set('plainPassword', v)}
                            disabled={createUser.isPending}
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormGroupLabel>{t('Type')}</FormGroupLabel>
                        <input
                            type="text"
                            className="form-control"
                            value="dev"
                            disabled
                            readOnly
                        />
                    </FormGroup>

                    <FormGroup>
                        <div className="d-flex align-items-center gap-sm">
                            <div className="form-check form-switch mb-0">
                                <input
                                    id="create-user-active"
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={form.active}
                                    onChange={e => set('active', e.target.checked)}
                                    disabled={createUser.isPending}
                                />
                            </div>
                            <label htmlFor="create-user-active" className="form-check-label cursor-pointer">
                                {t('Active')}
                            </label>
                        </div>
                    </FormGroup>
                </div>
            </ModalBody>

            <div style={{padding: PAD, paddingTop: 0}}>
                <ModalFooter>
                    <Button type="default" onClick={onClose} disabled={createUser.isPending}>
                        {t('Cancel')}
                    </Button>
                    <Button
                        type="primary"
                        icon="lni-user-add-1"
                        onClick={handleSubmit}
                        loading={createUser.isPending}
                        disabled={!form.email || !form.plainPassword || createUser.isPending}
                    >
                        {t('Create user')}
                    </Button>
                </ModalFooter>
            </div>
        </Modal>
    );
};
