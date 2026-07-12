import Modal from 'react-modal';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {ModalHeader} from './ReactModal/ModalHeader.jsx';
import {ModalBody} from './ReactModal/ModalBody.jsx';
import {ModalFooter} from './ReactModal/ModalFooter.jsx';
import {Button} from './Buttons/Button.jsx';

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '420px',
        maxWidth: '90vw',
    },
};

/**
 * Generic "are you sure?" dialog. Meant to replace window.confirm() for
 * destructive actions (delete, archive, etc.) so they match the app's
 * modal styling instead of the browser's native confirm box.
 */
export const ConfirmModal = ({
                                 isVisible = false,
                                 title,
                                 message = '',
                                 confirmLabel,
                                 cancelLabel,
                                 confirmType = 'danger',
                                 confirmIcon = '',
                                 loading = false,
                                 onConfirm = () => {
                                 },
                                 onCancel = () => {
                                 },
                             }) => {
    const {t} = useTranslation();

    return (
        <Modal style={customStyles} isOpen={isVisible} onRequestClose={onCancel}>
            <ModalHeader title={title}/>
            <ModalBody>
                <p className="mb-0">{message}</p>
            </ModalBody>
            <ModalFooter>
                <Button type="light" onClick={onCancel} disabled={loading}>
                    {cancelLabel ?? t('Cancel')}
                </Button>
                <Button type={confirmType} icon={confirmIcon} onClick={onConfirm} loading={loading}>
                    {confirmLabel ?? t('Confirm')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ConfirmModal.propTypes = {
    isVisible: PropTypes.bool,
    title: PropTypes.string.isRequired,
    message: PropTypes.node,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    confirmType: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'link', 'warning', 'info', 'light', 'dark']),
    confirmIcon: PropTypes.string,
    loading: PropTypes.bool,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
};
