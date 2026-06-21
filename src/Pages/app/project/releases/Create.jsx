import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {useTranslation} from "react-i18next";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {useState} from "react";
import {useProjectStore} from "../../../../Store/PrivateData/ProjectsStore.js";
import {EditReleaseForm} from "../../../../Components/Releases/EditReleaseForm.jsx";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {useNavigate} from "react-router";

export const Create = () => {
    const {t} = useTranslation();
    let navigate = useNavigate();
    const {currentProject} = useProjectStore();
    const [newRelease, setNewRelease] = useState({
        name: '',
        description: '',
        id: undefined,
        project: undefined,
    });

    const handleCancel = () => {
        // go back to /app/project/releases
        navigate('/app/project/releases');
    }

    const handleCreated = (release) => {
        // go to /app/project/releases/:id
        navigate('/app/project/releases/' + release.id);
    }

    return <>
        <PageContentWrapper>
            <PageTitle title={t('Create new release')}>
                <Button onClick={handleCancel} type="light" size="sm">{t('Cancel')}</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col>
                        <Card>
                            <CardHeader
                                title={t('Create a new release in {{project}}', {project: currentProject?.name})}/>
                            <CardBody>
                                <EditReleaseForm release={newRelease}
                                                 onCancel={handleCancel}
                                                 onUpdate={handleCreated}/>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </PageElementWrapper>

        </PageContentWrapper>
    </>
}
