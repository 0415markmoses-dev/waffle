import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {useState} from "react";
import {useProjectStore} from "../../../../Store/PrivateData/ProjectsStore.js";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {useNavigate} from "react-router";
import {EditQuestionForm} from "../../../../Components/Questions/EditQuestionForm.jsx";
import {useTranslation} from "react-i18next";

export const Create = () => {
    const {t} = useTranslation();
    let navigate = useNavigate();
    const {currentProject} = useProjectStore();
    const [newQuestion, setNewQuestion] = useState({
        name: '',
        description: '',
        id: undefined,
        test_plan: undefined,
    });

    const handleCancel = () => {
        // go back to previous page
        navigate(-1);
    }

    const handleCreated = (release) => {
        // go to /app/project/releases/:id
        navigate('/app/project/releases/' + release.id);
    }

    return <>
        <PageContentWrapper>
            <PageTitle title={t("Create new question")}>
                <Button onClick={handleCancel} type="light" size="sm">{t('Cancel')}</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col>
                        <Card>
                            <CardHeader title={t("Create new question")}/>
                            <CardBody>
                                <EditQuestionForm question={newQuestion}
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
