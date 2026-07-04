import Modal from 'react-modal';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {DuplicateTestingPlan} from './DuplicateTestingPlan.jsx';

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '780px',
        maxWidth: '920px',
        width: '100%',
    },
};

export const ModalDuplicateTestingPlan = ({
                                              isVisible = false,
                                              testPlanId,
                                              onClose = () => {
                                              },
                                          }) => {
    const {t} = useTranslation();
    return (
        <Modal style={customStyles} isOpen={isVisible} onRequestClose={onClose}>
            <ModalHeader title={t('Duplicate this testing plan')}/>
            <ModalBody>
                {isVisible && (
                    <DuplicateTestingPlan
                        sourceTestPlanId={testPlanId}
                        onCancel={onClose}
                    />
                )}
            </ModalBody>
        </Modal>
    );
};

ModalDuplicateTestingPlan.propTypes = {
    isVisible: PropTypes.bool,
    testPlanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onClose: PropTypes.func,
};
