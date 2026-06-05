import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {FormGroupWrapper} from "../UI/Form/FormGroupWrapper.jsx";
import {useState} from "react";
import PropTypes from "prop-types";
import {MkEditorInstance} from "../UI/Form/Editor/MkEditorInstance.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useTranslation} from "react-i18next";
import {Textarea} from "../UI/Form/Inputs/Textarea.jsx";
import {LocalDatetimeInput} from "../UI/Form/Inputs/LocalDatetimeInput.jsx";
import {useCreateTestPlan, useUpdateTestPlan} from "../../Hooks/queries/useTestPlansQuery.js";

export const EditTestPlanForm = ({
                                     testPlan,
                                     parentRelease = null,
                                     onUpdate = () => {
                                     },
                                     onCancel = () => {
                                     },
                                 }) => {
    const {t} = useTranslation();
    const {currentProject} = useProjectStore();
    const [entityName, setEntityName] = useState(testPlan.name ?? '');
    const [entityDeadline, setEntityDeadline] = useState(testPlan.dueDate ?? '');
    const [entityDescription, setEntityDescription] = useState(testPlan.description ?? '');
    const [entityContent, setEntityContent] = useState(testPlan?.content ?? '');

    const updateTestPlan = useUpdateTestPlan();
    const createTestPlan = useCreateTestPlan();
    const isLoading = updateTestPlan.isPending || createTestPlan.isPending;

    const handleUpdate = () => {
        if (testPlan?.id !== undefined) {
            updateTestPlan.mutate(
                {
                    id: testPlan.id,
                    data: {
                        name: entityName,
                        description: entityDescription,
                        content: entityContent,
                        dueDate: entityDeadline
                    }
                },
                {onSuccess: (data) => onUpdate(data)}
            );
        } else {
            if (!currentProject) {
                console.error("No current project selected");
                return;
            }
            if (!parentRelease?.id) {
                console.error("No parent release selected");
                return;
            }
            createTestPlan.mutate(
                {
                    name: entityName,
                    description: entityDescription,
                    content: entityContent,
                    dueDate: entityDeadline,
                    release: parentRelease['@id'],
                    state: 'draft'
                },
                {onSuccess: (data) => onUpdate(data)}
            );
        }
    };

    return (
        <FormGroupWrapper>
            <FormGroup>
                <FormGroupLabel>{t('Test Plan Name')}</FormGroupLabel>
                <TextInput onChange={value => setEntityName(value)} value={entityName}/>
            </FormGroup>
            <FormGroup>
                <FormGroupLabel>{t('Test Plan Deadline')}</FormGroupLabel>
                <LocalDatetimeInput value={entityDeadline} onChange={value => setEntityDeadline(value)}/>
            </FormGroup>
            <FormGroup>
                <FormGroupLabel>{t('Test Plan Summary')}</FormGroupLabel>
                <Textarea onChange={value => setEntityDescription(value)} value={entityDescription}/>
            </FormGroup>
            <FormGroup>
                <FormGroupLabel>{t('Test Plan Introduction')}</FormGroupLabel>
                <MkEditorInstance onChange={value => setEntityContent(value)} value={entityContent}/>
            </FormGroup>
            <FormGroup className="d-flex justify-content-center gap-md">
                {!isLoading && (
                    <Button loading={isLoading} onClick={onCancel} type="light">
                        {t('Cancel')}
                    </Button>
                )}
                <Button icon="lni-download-1" onClick={handleUpdate} loading={isLoading} type="primary">
                    {t('Save changes')}
                </Button>
            </FormGroup>
        </FormGroupWrapper>
    );
};

EditTestPlanForm.propTypes = {
    testPlan: PropTypes.object.isRequired,
    parentRelease: PropTypes.object,
    onUpdate: PropTypes.func,
    onCancel: PropTypes.func,
};
