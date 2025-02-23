import {FormGroup} from "../UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../UI/Form/FormGroupLabel.jsx";
import {TextInput} from "../UI/Form/Inputs/TextInput.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {FormGroupWrapper} from "../UI/Form/FormGroupWrapper.jsx";
import {useState} from "react";
import PropTypes from "prop-types";
import {MkEditorInstance} from "../UI/Form/Editor/MkEditorInstance.jsx";
import ReleasesService from "../../Services/PrivateApi/ReleasesService.js";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";

export const EditReleaseForm = ({
                                    release,
                                    onUpdate = () => {
                                    },
                                    onCancel = () => {
                                    },
                                }) => {
    const {currentProject} = useProjectStore();
    const [loading, setLoading] = useState(false);
    const [releaseName, setReleaseName] = useState(release.name);
    const [releaseDescription, setReleaseDescription] = useState(release.description);

    const handleCancel = () => {
        onCancel();
    }

    const handleUpdate = () => {
        setLoading(true);
        if (release?.id !== undefined) {
            ReleasesService.updateRelease(release.id, {
                name: releaseName,
                description: releaseDescription
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
            // create release
            ReleasesService.createRelease({
                name: releaseName,
                description: releaseDescription,
                project: currentProject['@id'],
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
                Release name
            </FormGroupLabel>
            <TextInput onChange={value => setReleaseName(value)}
                       value={releaseName}/>
        </FormGroup>
        <FormGroup>
            <FormGroupLabel>
                Release Description
            </FormGroupLabel>
            <MkEditorInstance
                onChange={value => setReleaseDescription(value)}
                value={releaseDescription}/>
        </FormGroup>
        <FormGroup className="d-flex justify-content-center gap-md">
            {!loading && (
                <Button loading={loading}
                        onClick={handleCancel}
                        type="light">
                    Cancel
                </Button>
            )}
            <Button icon="lni-download-1"
                    onClick={handleUpdate}
                    loading={loading}
                    type="primary">
                Save changes
            </Button>
        </FormGroup>
    </FormGroupWrapper>

}

EditReleaseForm.propTypes = {
    release: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    onCancel: PropTypes.func
}
