import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {FormGroupWrapper} from "../UI/Form/FormGroupWrapper.jsx";
import {useState} from "react";
import PropTypes from "prop-types";
import {MkEditorInstance} from "../UI/Form/Editor/MkEditorInstance.jsx";
import {useTranslation} from "react-i18next";
import {TestPlanSelector} from "../TestPlans/TestPlanSelector.jsx";
import {Alert} from "../UI/Alert/Alert.jsx";
import {useCreateQuestion, useUpdateQuestion} from "../../Hooks/queries/useQuestionsQuery.js";
import {useTestPlan} from "../../Hooks/queries/useTestPlansQuery.js";

export const EditQuestionForm = ({
                                     question,
                                     onUpdate = () => {
                                     },
                                     onCancel = () => {
                                     },
                                 }) => {
    const {t} = useTranslation();
    const [questionName, setQuestionName] = useState(question.name ?? '');
    const [questionContent, setQuestionContent] = useState(question.description ?? '');

    // Pre-fill from ?t= query param if no test_plan on question
    const urlTestPlanId = !question.test_plan
        ? new URLSearchParams(window.location.search).get('t')
        : null;

    const {data: prefillTestPlan} = useTestPlan(urlTestPlanId);
    const [parentTestPlan, setParentTestPlan] = useState(question.test_plan ?? null);

    // Use prefilled plan if no parentTestPlan set yet
    const effectiveTestPlan = parentTestPlan ?? prefillTestPlan ?? null;

    const updateQuestion = useUpdateQuestion();
    const createQuestion = useCreateQuestion();
    const isLoading = updateQuestion.isPending || createQuestion.isPending;

    const handleUpdate = () => {
        const payload = {
            name: questionName,
            description: questionContent,
            ...(effectiveTestPlan?.['@id'] ? {plan: effectiveTestPlan['@id']} : {}),
        };

        if (question?.id !== undefined) {
            updateQuestion.mutate(
                {id: question.id, data: payload},
                {onSuccess: (data) => onUpdate(data)}
            );
        } else {
            createQuestion.mutate(payload, {onSuccess: (data) => onUpdate(data)});
        }
    };

    return (
        <FormGroupWrapper>
            <FormGroup>
                <FormGroupLabel>{t('Question name')}</FormGroupLabel>
                <TextInput onChange={value => setQuestionName(value)} value={questionName}/>
                {questionName === '' && (
                    <div className="mt-2">
                        <Alert type="info">{t('Question name is required')}</Alert>
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <FormGroupLabel>{t('Testing Plan')}</FormGroupLabel>
                <TestPlanSelector value={effectiveTestPlan} onChange={testPlan => setParentTestPlan(testPlan)}/>
                {!effectiveTestPlan && (
                    <div className="mt-2">
                        <Alert type="info">{t("Question's parent is required")}</Alert>
                    </div>
                )}
            </FormGroup>
            <FormGroup>
                <FormGroupLabel>{t('Question Content')}</FormGroupLabel>
                <MkEditorInstance onChange={value => setQuestionContent(value)} value={questionContent}/>
            </FormGroup>
            <FormGroup className="d-flex justify-content-center gap-md">
                {!isLoading && (
                    <Button loading={isLoading} onClick={onCancel} type="light">
                        {t('Cancel')}
                    </Button>
                )}
                <Button
                    icon="lni-download-1"
                    onClick={handleUpdate}
                    disabled={!effectiveTestPlan || questionName === ''}
                    loading={isLoading}
                    type="primary"
                >
                    {t('Save changes')}
                </Button>
            </FormGroup>
        </FormGroupWrapper>
    );
};

EditQuestionForm.propTypes = {
    question: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    onCancel: PropTypes.func,
};
