import Modal from 'react-modal';
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useState} from "react";
import {ModalHeader} from "../UI/ReactModal/ModalHeader.jsx";
import {ModalBody} from "../UI/ReactModal/ModalBody.jsx";
import {ModalFooter} from "../UI/ReactModal/ModalFooter.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {ProjectDisplayCard} from "./ProjectDisplayCard.jsx";
import {Loader} from "../UI/Loader.jsx";
import {useProjects} from "../../Hooks/queries/useProjectsQuery.js";

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

export const ModalSelectProject = () => {
    const {currentProject, selectionModalVisible, setCurrentProject} = useProjectStore();
    const [targetProject, setTargetProject] = useState(currentProject);

    const {data, isLoading} = useProjects({limit: 100, page: 1});
    const projects = data?.member ?? [];

    const handleSelectButton = (e) => {
        e?.preventDefault();
        if (targetProject) {
            setCurrentProject(targetProject);
        }
    };

    return (
        <Modal style={customStyles} isOpen={selectionModalVisible}>
            <ModalHeader
                title="Select a project"
                subtitle="You have to select a project to continue using the app"
            />
            <ModalBody>
                {isLoading && <Loader/>}
                {!isLoading && (
                    <div className="project-listing d-flex flex-column gap-md">
                        {projects.map(project => (
                            <ProjectDisplayCard
                                key={project.id}
                                active={targetProject?.id === project.id}
                                interractive
                                onClick={(e) => {
                                    e.preventDefault();
                                    setTargetProject(project);
                                }}
                                project={project}
                            />
                        ))}
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={!targetProject}
                    onClick={handleSelectButton}
                    icon="lni-check"
                    type="primary"
                >
                    Select project
                </Button>
            </ModalFooter>
        </Modal>
    );
};
