import Modal from 'react-modal';
import {ModalHeader} from "../UI/ReactModal/ModalHeader.jsx";
import {ModalBody} from "../UI/ReactModal/ModalBody.jsx";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";
import {Button} from "../UI/Buttons/Button.jsx";
import {ModalFooter} from "../UI/ReactModal/ModalFooter.jsx";
import {useEffect, useState} from "react";
import TestPlansService from "../../Services/PrivateApi/TestPlansService.js";
import {Card} from "../UI/Card/Card.jsx";
import {CardBody} from "../UI/Card/CardBody.jsx";
import {CardHeader} from "../UI/Card/CardHeader.jsx";

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
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState(testPlan?.state ?? 'draft');

    useEffect(() => {
        setState(testPlan?.state ?? 'draft');
    }, [testPlan?.id]);

    const handleUpdateTestPlan = () => {
        setLoading(true);
        onProgress();
        TestPlansService.updateTestPlan(testPlan.id, {
            state: state,
        })
            .then(response => {
                onConfirm(response.data);
            })
            .finally(() => {
                setLoading(false);
            })
        ;

    }

    const handleStateChange = (state) => {
        setState(state);
    }

    return <>
        <Modal style={customStyles} isOpen={isVisible}>
            <ModalHeader
                title={t('Change testing plan state')}
            />
            <ModalBody>
                <div className="w-100 d-flex justify-content-center gap-md">
                    <Card className="w-100" interractive={true}
                          active={state === 'draft'}
                          onClick={() => handleStateChange('draft')}>
                        <CardHeader title={t('Draft')}/>
                        <CardBody>
                            <div className="d-flex x">
                                <img className="w-100 horizontal-flip-img"
                                     src="/assets/draft.jpg"
                                     alt="notif"/>
                            </div>
                            <p>
                                {t('Draft description')}
                            </p>
                        </CardBody>
                    </Card>
                    <Card className="w-100" interractive={true}
                          active={state === 'published'}
                          onClick={() => handleStateChange('published')}>
                        <CardHeader title={t('Published')}/>
                        <CardBody>
                            <div className="d-flex x">
                                <img className="w-100"
                                     src="/assets/testers.jpg"
                                     alt="notif"/>
                            </div>
                            <p>
                                {t('Published description')}
                            </p>
                        </CardBody>
                    </Card>
                    <Card className="w-100" interractive={true}
                          active={state === 'archived'}
                          onClick={() => handleStateChange('archived')}>
                        <CardHeader title={t('Archived')}/>
                        <CardBody>
                            <div className="d-flex x">
                                <img className="w-100"
                                     src="/assets/sleep.jpg"
                                     alt="notif"/>
                            </div>
                            <p>
                                {t('Archived description')}
                            </p>
                        </CardBody>
                    </Card>
                </div>

            </ModalBody>
            <ModalFooter>
                <Button loading={loading}
                        onClick={() => onCancel()}
                        type="light">
                    {t('Cancel')}
                </Button>
                <Button loading={loading}
                        onClick={handleUpdateTestPlan}
                        icon="lni-check" type="primary">
                    {t('Edit')}
                </Button>
            </ModalFooter>
        </Modal>
    </>
}

ModalChangeTestPlanState.propTypes = {
    isVisible: PropTypes.bool,
    testPlan: PropTypes.object,
    onProgress: PropTypes.func,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
}
