import Modal from 'react-modal';
import {ModalHeader} from "../UI/ReactModal/ModalHeader.jsx";
import {ModalBody} from "../UI/ReactModal/ModalBody.jsx";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";
import {Button} from "../UI/Buttons/Button.jsx";
import {ModalFooter} from "../UI/ReactModal/ModalFooter.jsx";
import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {useState} from "react";
import TestersService from "../../Services/PrivateApi/TestersService.js";

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


export const ModalCreateNewTester = ({
                                         isVisible = false,
                                         onCancel = () => {
                                         },
                                         onProgress = () => {
                                         },
                                         onConfirm = () => {
                                         },
                                     }) => {
    const {t} = useTranslation();
    const [testerEmail, setTesterEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateTester = () => {
        setLoading(true);
        onProgress();
        TestersService.createTester({
            email: testerEmail,
        })
            .then(response => {
                onConfirm(response.data);
            })
            .finally(() => {
                setLoading(false);
            })
        ;

    }

    return <>
        <Modal style={customStyles} isOpen={isVisible}>
            <ModalHeader
                title={t('Create tester')}
                subtitle={t('Create tester modal subtitle')}
            />
            <ModalBody>
                <FormGroup>
                    <FormGroupLabel>
                        {t('Tester\'s email')}
                    </FormGroupLabel>
                    <TextInput onChange={value => setTesterEmail(value)}
                               disabled={loading}
                               type="email" placeholder="email.name@myemail.tld"
                               value={testerEmail}/>
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button loading={loading}
                        onClick={() => onCancel()}
                        type="light">
                    {t('Cancel')}
                </Button>
                <Button disabled={(testerEmail === null || testerEmail === undefined || testerEmail === '')}
                        loading={loading}
                        onClick={handleCreateTester}
                        icon="lni-check" type="primary">
                    {t('Create')}
                </Button>
            </ModalFooter>
        </Modal>
    </>
}

ModalCreateNewTester.propTypes = {
    isVisible: PropTypes.bool,
    onProgress: PropTypes.func,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
}
