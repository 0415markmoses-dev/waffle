import Modal from 'react-modal';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {BulkTestersAdd} from './BulkTestersAdd.jsx';

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '520px',
        maxWidth: '660px',
        width: '100%',
    },
};

export const ModalBulkTestersAdd = ({
                                        isVisible = false,
                                        testPlan,
                                        onClose = () => {
                                        },
                                        onEnd = () => {
                                        },
                                        onSuccessItem = () => {
                                        },
                                        onErrorItem = () => {
                                        },
                                    }) => {
    const {t} = useTranslation();
    return (
        <Modal style={customStyles} isOpen={isVisible} onRequestClose={onClose}>
            <ModalHeader title={`${t('Add bulk testers')}${testPlan?.name ? ` — ${testPlan.name}` : ''}`}/>
            <ModalBody>
                <BulkTestersAdd
                    testPlanId={testPlan?.id}
                    onEnd={onEnd}
                    onSuccessItem={onSuccessItem}
                    onErrorItem={onErrorItem}
                    onCancel={onClose}
                />
            </ModalBody>
        </Modal>
    );
};

ModalBulkTestersAdd.propTypes = {
    isVisible: PropTypes.bool,
    testPlan: PropTypes.object,
    onClose: PropTypes.func,
    onEnd: PropTypes.func,
    onSuccessItem: PropTypes.func,
    onErrorItem: PropTypes.func,
};
