import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {ListReleases} from "../../../../Components/Releases/ListReleases.jsx";
import {useProjectStore} from "../../../../Store/PrivateData/ProjectsStore.js";
import {useNavigate} from "react-router";

export const Listing = () => {
    let navigate = useNavigate();
    const {currentProject} = useProjectStore();
    if (currentProject?.id === undefined) {
        // Redirect to dashboard
        navigate('/app/');
        return null;
    }

    return <>
        <PageContentWrapper>
            <PageTitle title={currentProject.name + " - All Release"}>
                <Button icon="lni-plus"
                        type="light" size="sm">New release</Button>
                <Button type="light" size="sm">Petit button</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        couocu
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={12} xl={8}>
                        <Row>
                            <Col size={12}>
                                <ListReleases/>
                            </Col>
                        </Row>
                    </Col>
                </Row>

            </PageElementWrapper>
        </PageContentWrapper>
    </>
}
