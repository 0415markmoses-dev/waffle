import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {FormGroupWrapper} from "../UI/Form/FormGroupWrapper.jsx";
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {MkEditorInstance} from "../UI/Form/Editor/MkEditorInstance.jsx";
import QuestionsService from "../../Services/PrivateApi/QuestionsService.js";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useTranslation} from "react-i18next";
import {TestPlanSelector} from "../TestPlans/TestPlanSelector.jsx";
import {Alert} from "../UI/Alert/Alert.jsx";
import TestPlansService from "../../Services/PrivateApi/TestPlansService.js";

export const EditQuestionForm = ({
                                     question,
                                     onUpdate = () => {
                                     },
                                     onCancel = () => {
                                     },
                                 }) => {
    const {currentProject} = useProjectStore();
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    const [questionName, setQuestionName] = useState(question.name);
    const [questionContent, setQuestionContent] = useState(question.description);
    const [parentTestPlan, setParentTestPlan] = useState(question.test_plan);

    useEffect(() => {
        if (question?.test_plan === undefined) {
            // check if there is a "t" in query string
            const urlParams = new URLSearchParams(window.location.search);
            const testPlanId = urlParams.get('t');
            if (testPlanId !== null && testPlanId !== undefined) {
                TestPlansService.getOne(testPlanId)
                    .then(response => {
                        setParentTestPlan(response?.data);
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        }
    }, []);

    const handleCancel = () => {
        onCancel();
    }

    const handleUpdate = () => {
        setLoading(true);
        if (question?.id !== undefined) {
            QuestionsService.updateQuestion(question.id, {
                name: questionName,
                description: questionContent
            })
                .then(response => {
                    onUpdate(response.data);
                })
                .catch(error => {
                    console.log(error);
                })
                .finally(() => {
                    setLoading(false);
                })
        } else {
            // create question
            QuestionsService.createQuestion({
                name: questionName,
                description: questionContent,
            })
                .then(response => {
                    onUpdate(response.data);
                })
                .catch(error => {
                    console.log(error);
                })
                .finally(() => {
                    setLoading(false);
                })
        }


    }


    return <FormGroupWrapper>
        <FormGroup>
            <FormGroupLabel>
                {t('Question name')}
            </FormGroupLabel>
            <TextInput onChange={value => setQuestionName(value)}
                       value={questionName}/>
            {questionName === '' && (
                <div className="mt-2">
                    <Alert type="info">
                        {t('Question name is required')}
                    </Alert>
                </div>
            )}
        </FormGroup>
        <FormGroup>
            <FormGroupLabel>
                {t('Testing Plan')}
            </FormGroupLabel>
            <TestPlanSelector value={parentTestPlan} onChange={testPlan => setParentTestPlan(testPlan)}/>
            {(parentTestPlan === undefined || parentTestPlan === null) && (
                <div className="mt-2">
                    <Alert type="info">
                        {t('Question\'s parent is required')}
                    </Alert>
                </div>
            )}
        </FormGroup>
        <FormGroup>
            <FormGroupLabel>
                {t('Question Content')}
            </FormGroupLabel>
            <MkEditorInstance
                onChange={value => setQuestionContent(value)}
                value={questionContent}/>
        </FormGroup>
        <FormGroup className="d-flex justify-content-center gap-md">
            {!loading && (
                <Button loading={loading}
                        onClick={handleCancel}
                        type="light">
                    {t('Cancel')}
                </Button>
            )}
            <Button icon="lni-download-1"
                    onClick={handleUpdate}
                    disabled={parentTestPlan === undefined || questionName === ''}
                    loading={loading}
                    type="primary">
                {t('Save changes')}
            </Button>
        </FormGroup>
    </FormGroupWrapper>

}

EditQuestionForm.propTypes = {
    question: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    onCancel: PropTypes.func
}
