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
import {useCreateTester} from "../../Hooks/queries/useTestersQuery.js";

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
    const createTester = useCreateTester();

    const handleCreateTester = () => {
        onProgress();
        createTester.mutate(
            {email: testerEmail},
            {onSuccess: (data) => onConfirm(data)}
        );
    };

    return (
        <Modal style={customStyles} isOpen={isVisible}>
            <ModalHeader
                title={t('Create tester')}
                subtitle={t('Create tester modal subtitle')}
            />
            <ModalBody>
                <FormGroup>
                    <FormGroupLabel>{t("Tester's email")}</FormGroupLabel>
                    <TextInput
                        onChange={value => setTesterEmail(value)}
                        disabled={createTester.isPending}
                        type="email"
                        placeholder="email.name@myemail.tld"
                        value={testerEmail}
                    />
                </FormGroup>
            </ModalBody>
            <ModalFooter>
                <Button loading={createTester.isPending} onClick={onCancel} type="light">
                    {t('Cancel')}
                </Button>
                <Button
                    disabled={!testerEmail}
                    loading={createTester.isPending}
                    onClick={handleCreateTester}
                    icon="lni-check"
                    type="primary"
                >
                    {t('Create')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ModalCreateNewTester.propTypes = {
    isVisible: PropTypes.bool,
    onProgress: PropTypes.func,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
};
