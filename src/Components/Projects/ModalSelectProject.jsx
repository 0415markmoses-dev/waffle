import Modal from 'react-modal';
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useEffect, useState} from "react";
import ProjectService from "../../Services/PrivateApi/ProjectService.js";
import {ModalHeader} from "../UI/ReactModal/ModalHeader.jsx";
import {ModalBody} from "../UI/ReactModal/ModalBody.jsx";
import {ModalFooter} from "../UI/ReactModal/ModalFooter.jsx";
import {Button} from "../UI/Buttons/Button.jsx";
import {ProjectDisplayCard} from "./ProjectDisplayCard.jsx";
import {Loader} from "../UI/Loader.jsx";

Modal.setAppElement('#root');

// @see https://www.npmjs.com/package/react-modal#demos

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
    const {currentProject, selectionModalVisible, setCurrentProject, closeSelectionModal} = useProjectStore();
    const [projects, setProjects] = useState([]);
    const [targetProject, setTargetProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(selectionModalVisible);
        setTargetProject(currentProject);
        if (selectionModalVisible === false) {
            return;
        }
        setLoading(true);
        ProjectService.getProjects({
            limit: 100,
            page: 1
        })
            .then((response) => {
                if (response.data['member'] !== undefined) {
                    setProjects(response.data['member']);
                }
            })
            .finally(() => setLoading(false))
        ;

        //console.log('set visible', visible, selectionModalVisible);
    }, [selectionModalVisible]);


    const handleClick = (project) => {
        setTargetProject(project);
    }

    //console.log('visible value', visible, selectionModalVisible);
    const handleSelectButton = e => {
        e.preventDefault();
        if (targetProject !== null) {
            console.log('selected project', targetProject);
            setCurrentProject(targetProject);
            closeSelectionModal();
        }
    }


    return (
        <>
            <Modal style={customStyles} isOpen={visible}>
                <ModalHeader
                    title="Select a project"
                    subtitle="You have to select a project to continue using the app"
                />
                <ModalBody>
                    {loading && <Loader/>}
                    {!loading && (
                        <div className="project-listing d-flex flex-column gap-md">
                            {
                                projects.map(project => {
                                    return <ProjectDisplayCard active={targetProject?.id === project.id}
                                                               interractive
                                                               onClick={e => {
                                                                   e.preventDefault();
                                                                   handleClick(project);
                                                               }}
                                                               project={project}

                                                               key={project.id}/>
                                })
                            }
                        </div>
                    )}

                </ModalBody>
                <ModalFooter>
                    <Button disabled={(targetProject === null || targetProject === undefined)}
                            onClick={handleSelectButton}
                            icon="lni-check" type="primary">Select project</Button>
                </ModalFooter>

            </Modal>
        </>
    )
}
