import Modal from 'react-modal';
import {useNavigate} from "react-router-dom";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {ModalHeader} from "../UI/ReactModal/ModalHeader.jsx";
import {ModalBody} from "../UI/ReactModal/ModalBody.jsx";
import {ModalFooter} from "../UI/ReactModal/ModalFooter.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {ProjectDisplayCard} from "./ProjectDisplayCard.jsx";
import {ModalCreateProject} from "./ModalCreateProject.jsx";
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
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {
        currentProject,
        selectionModalVisible,
        setCurrentProject,
        openSelectionModal,
        closeSelectionModal,
    } = useProjectStore();
    const [targetProject, setTargetProject] = useState(currentProject);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const {data, isLoading} = useProjects({limit: 100, page: 1});
    const projects = data?.member ?? [];

    const handleSelectButton = (e) => {
        e?.preventDefault();
        if (targetProject) {
            setCurrentProject(targetProject);
            navigate('/app/');
        }
    };

    const handleOpenCreateProject = () => {
        closeSelectionModal();
        setCreateModalOpen(true);
    };

    const handleCancelCreateProject = () => {
        setCreateModalOpen(false);
        openSelectionModal();
    };

    const handleProjectCreated = (project) => {
        setCreateModalOpen(false);
        setCurrentProject(project);
        navigate('/app/project-settings');
    };

    return (
        <>
            <Modal style={customStyles} isOpen={selectionModalVisible}>
                <ModalHeader
                    title="Select a project"
                    subtitle="You have to select a project to continue using the app"
                />
                <ModalBody>
                    {isLoading && <Loader/>}
                    {!isLoading && (
                        <div className="project-listing d-flex flex-column gap-md">
                            <div
                                className="project-card project-card--create card cursor-pointer"
                                onClick={handleOpenCreateProject}
                            >
                                <div className="card-body d-flex align-items-center justify-content-center gap-sm">
                                    <i className="font-icon lni lni-plus"/>
                                    <span>{t('Create a new project')}</span>
                                </div>
                            </div>
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

            <ModalCreateProject
                isVisible={createModalOpen}
                onCancel={handleCancelCreateProject}
                onCreated={handleProjectCreated}
            />
        </>
    );
};
