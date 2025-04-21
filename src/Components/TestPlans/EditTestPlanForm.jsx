import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {FormGroupWrapper} from "../UI/Form/FormGroupWrapper.jsx";
import {useState} from "react";
import PropTypes from "prop-types";
import {MkEditorInstance} from "../UI/Form/Editor/MkEditorInstance.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import TestPlansService from "../../Services/PrivateApi/TestPlansService.js";
import {useTranslation} from "react-i18next";
import {Textarea} from "../UI/Form/Inputs/Textarea.jsx";
import {LocalDatetimeInput} from "../UI/Form/Inputs/LocalDatetimeInput.jsx";

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
    const [loading, setLoading] = useState(false);
    const [entityName, setEntityName] = useState(testPlan.name);
    const [entityDeadline, setEntityDeadline] = useState(testPlan.dueDate);
    const [entityDescription, setEntityDescription] = useState(testPlan.description);
    const [entityContent, setEntityContent] = useState((testPlan?.content ?? ''));

    const handleCancel = () => {
        onCancel();
    }

    const handleUpdate = () => {
        setLoading(true);
        if (testPlan?.id !== undefined) {
            TestPlansService.updateTestPlan(testPlan.id, {
                name: entityName,
                description: entityDescription,
                content: entityContent,
                dueDate: entityDeadline,
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
            if (currentProject === null) {
                console.error("No current project selected");
                return;
            }
            if (parentRelease?.id === null) {
                console.error("No parent release selected");
                return;
            }
            // create release
            TestPlansService.createTestPlan({
                name: entityName,
                description: entityDescription,
                content: entityContent,
                dueDate: entityDeadline,
                release: parentRelease['@id'],
                state: 'draft',
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
                {t('Test Plan Name')}
            </FormGroupLabel>
            <TextInput onChange={value => setEntityName(value)}
                       value={entityName}/>
        </FormGroup>
        <FormGroup>
            <FormGroupLabel>
                {t('Test Plan Deadline')}
            </FormGroupLabel>
            <LocalDatetimeInput value={entityDeadline}
                                onChange={value => setEntityDeadline(value)}
            />
        </FormGroup>
        <FormGroup>
            <FormGroupLabel>
                {t('Test Plan Summary')}
            </FormGroupLabel>
            <Textarea onChange={value => setEntityDescription(value)}
                      value={entityDescription}/>
        </FormGroup>
        <FormGroup>
            <FormGroupLabel>
                {t('Test Plan Introduction')}
            </FormGroupLabel>
            <MkEditorInstance
                onChange={value => setEntityContent(value)}
                value={entityContent}/>
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
                    loading={loading}
                    type="primary">
                {t('Save changes')}
            </Button>
        </FormGroup>
    </FormGroupWrapper>

}

EditTestPlanForm.propTypes = {
    testPlan: PropTypes.object.isRequired,
    parentRelease: PropTypes.object,
    onUpdate: PropTypes.func,
    onCancel: PropTypes.func
}
