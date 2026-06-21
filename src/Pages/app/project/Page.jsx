import {PageContentWrapper} from "../../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../Components/UI/Card/CardBody.jsx";
import {CardFooter} from "../../../Components/UI/Card/CardFooter.jsx";
import {CardHeader} from "../../../Components/UI/Card/CardHeader.jsx";
import {Button} from "../../../Components/UI/Buttons/Button.jsx";
import {FormGroup} from "../../../Components/UI/Form/FormGroup.jsx";
import {FormGroupLabel} from "../../../Components/UI/Form/FormGroupLabel.jsx";
import {FormGroupWrapper} from "../../../Components/UI/Form/FormGroupWrapper.jsx";
import {TextInput} from "../../../Components/UI/Form/Inputs/TextInput.jsx";
import {MkEditorInstance} from "../../../Components/UI/Form/Editor/MkEditorInstance.jsx";
import {useProjectStore} from "../../../Store/PrivateData/ProjectsStore.js";
import {useProject, useUpdateProject} from "../../../Hooks/queries/useProjectsQuery.js";
import {useTranslation} from "react-i18next";
import {useState, useEffect} from "react";
import toast from "react-hot-toast";

export const Page = () => {
    const {t} = useTranslation();
    const {currentProject} = useProjectStore();
    const {data: project, isLoading} = useProject(currentProject?.id);
    const updateProject = useUpdateProject();

    const [name, setName] = useState('');
    const [editedDesc, setEditedDesc] = useState(null); // null = not yet edited

    // Sync name only (editor gets value directly from project)
    useEffect(() => {
        if (project) setName(project.name ?? '');
    }, [project?.id]);

    const handleSave = () => {
        const description = editedDesc ?? project.description ?? '';
        updateProject.mutate(
            {id: project.id, data: {name, description}},
            {
                onSuccess: () => toast.success(t('Project updated')),
                onError: (err) => {
                    const detail = err?.response?.data?.detail ?? err?.response?.data?.['hydra:description'] ?? t('Failed to update project.');
                    toast.error(detail);
                },
            }
        );
    };

    const isSaving = updateProject.isPending;

    return (
        <PageContentWrapper>
            <PageTitle
                title={t('Project')}
                noBreadcrumb
            />
            <PageElementWrapper>
                <Row>
                    {/* Col A — project details */}
                    <Col sm={12} xl={8}>
                        <Card>
                            <CardHeader title={t('Project details')}/>
                            <CardBody>
                                {isLoading || !project ? (
                                    <div className="text-muted">{t('Loading…')}</div>
                                ) : (
                                    <FormGroupWrapper>
                                        <FormGroup>
                                            <FormGroupLabel>{t('Project name')}</FormGroupLabel>
                                            <TextInput
                                                value={name}
                                                onChange={setName}
                                                placeholder={t('Project name')}
                                                disabled={isSaving}
                                            />
                                        </FormGroup>
                                        <FormGroup>
                                            <FormGroupLabel>{t('Description')}</FormGroupLabel>
                                            <MkEditorInstance
                                                key={project.id}
                                                value={project.description ?? ''}
                                                onChange={setEditedDesc}
                                            />
                                        </FormGroup>
                                        <FormGroup className="d-flex justify-content-end">
                                            <Button
                                                icon="lni-download-1"
                                                type="primary"
                                                size="sm"
                                                loading={isSaving}
                                                onClick={handleSave}
                                            >
                                                {t('Save changes')}
                                            </Button>
                                        </FormGroup>
                                    </FormGroupWrapper>
                                )}
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Col B — about */}
                    <Col sm={12} xl={4}>
                        <Card>
                            <CardHeader title={t('What is a project?')}/>
                            <CardBody>
                                <p>{t('What is a project description')}</p>
                                <div className="d-flex justify-content-center mt-3">
                                    <img src="/assets/testers.jpg" alt="" className="w-100" style={{borderRadius: 8}}/>
                                </div>
                            </CardBody>
                            <CardFooter>
                                <Button icon="lni-link-2-angular-right" type="link" size="sm">
                                    {t('View Documentation')}
                                </Button>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </PageElementWrapper>
        </PageContentWrapper>
    );
};
