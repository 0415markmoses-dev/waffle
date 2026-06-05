import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {FormGroupWrapper} from "../UI/Form/FormGroupWrapper.jsx";
import {useState} from "react";
import PropTypes from "prop-types";
import {MkEditorInstance} from "../UI/Form/Editor/MkEditorInstance.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useCreateRelease, useUpdateRelease} from "../../Hooks/queries/useReleasesQuery.js";

export const EditReleaseForm = ({
                                    release,
                                    onUpdate = () => {
                                    },
                                    onCancel = () => {
                                    },
                                }) => {
    const {currentProject} = useProjectStore();
    const [releaseName, setReleaseName] = useState(release.name ?? '');
    const [releaseDescription, setReleaseDescription] = useState(release.description ?? '');

    const updateRelease = useUpdateRelease();
    const createRelease = useCreateRelease();

    const isLoading = updateRelease.isPending || createRelease.isPending;

    const handleUpdate = () => {
        if (release?.id !== undefined) {
            updateRelease.mutate(
                {id: release.id, data: {name: releaseName, description: releaseDescription}},
                {onSuccess: (data) => onUpdate(data)}
            );
        } else {
            createRelease.mutate(
                {name: releaseName, description: releaseDescription, project: currentProject['@id']},
                {onSuccess: (data) => onUpdate(data)}
            );
        }
    };

    return (
        <FormGroupWrapper>
            <FormGroup>
                <FormGroupLabel>Release name</FormGroupLabel>
                <TextInput onChange={value => setReleaseName(value)} value={releaseName}/>
            </FormGroup>
            <FormGroup>
                <FormGroupLabel>Release Description</FormGroupLabel>
                <MkEditorInstance onChange={value => setReleaseDescription(value)} value={releaseDescription}/>
            </FormGroup>
            <FormGroup className="d-flex justify-content-center gap-md">
                {!isLoading && (
                    <Button loading={isLoading} onClick={onCancel} type="light">
                        Cancel
                    </Button>
                )}
                <Button icon="lni-download-1" onClick={handleUpdate} loading={isLoading} type="primary">
                    Save changes
                </Button>
            </FormGroup>
        </FormGroupWrapper>
    );
};

EditReleaseForm.propTypes = {
    release: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    onCancel: PropTypes.func,
};
