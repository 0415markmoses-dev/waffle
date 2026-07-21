import Modal from 'react-modal';
import {ModalHeader} from "../UI/ReactModal/ModalHeader.jsx";
import {ModalBody} from "../UI/ReactModal/ModalBody.jsx";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";
import {Button} from "../UI/Buttons/Button.jsx";
import {ModalFooter} from "../UI/ReactModal/ModalFooter.jsx";
import {useEffect, useState} from "react";
import {Card} from "../UI/Card/Card.jsx";
import {CardBody} from "../UI/Card/CardBody.jsx";
import {CardHeader} from "../UI/Card/CardHeader.jsx";
import {useUpdateTestPlan} from "../../Hooks/queries/useTestPlansQuery.js";

Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        maxWidth: '80vw',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        minWidth: '440px',
        maxHeight: '80vh',
    },
};

export const ModalChangeTestPlanState = ({
                                             isVisible = false,
                                             testPlan = undefined,
                                             onCancel = () => {
                                             },
                                             onProgress = () => {
                                             },
                                             onConfirm = () => {
                                             },
                                         }) => {
    const {t} = useTranslation();
    const [state, setState] = useState(testPlan?.state ?? 'draft');
    const updateTestPlan = useUpdateTestPlan();

    // Reset the selection only when a different plan is loaded into the modal —
    // not on every testPlan.state change, or the user's in-progress selection
    // would get clobbered right after they click a card.
    useEffect(() => {
        setState(testPlan?.state ?? 'draft');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [testPlan?.id]);

    const handleUpdateTestPlan = () => {
        onProgress();
        updateTestPlan.mutate(
            {id: testPlan.id, data: {state}},
            {onSuccess: (data) => onConfirm(data)}
        );
    };

    return (
        <Modal style={customStyles} isOpen={isVisible}>
            <ModalHeader title={t('Change testing plan state')}/>
            <ModalBody>
                <div className="w-100 d-flex justify-content-center gap-md">
                    {['draft', 'published', 'archived'].map((s) => (
                        <Card key={s} className="w-100" interractive={true} active={state === s}
                              onClick={() => setState(s)}>
                            <CardHeader title={t(s.charAt(0).toUpperCase() + s.slice(1))}/>
                            <CardBody>
                                <div className="d-flex x">
                                    <img className={`w-100${s === 'draft' ? ' horizontal-flip-img' : ''}`}
                                         src={`/assets/${s === 'draft' ? 'draft' : s === 'published' ? 'testers' : 'sleep'}.jpg`}
                                         alt={s}/>
                                </div>
                                <p>{t(`${s.charAt(0).toUpperCase() + s.slice(1)} description`)}</p>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button loading={updateTestPlan.isPending} onClick={onCancel} type="light">
                    {t('Cancel')}
                </Button>
                <Button loading={updateTestPlan.isPending} onClick={handleUpdateTestPlan} icon="lni-check"
                        type="primary">
                    {t('Edit')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ModalChangeTestPlanState.propTypes = {
    isVisible: PropTypes.bool,
    testPlan: PropTypes.object,
    onProgress: PropTypes.func,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
};
