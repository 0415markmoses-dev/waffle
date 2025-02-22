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
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";

export const Listing = () => {
    let navigate = useNavigate();
    const {currentProject} = useProjectStore();

    const handleNewReleaseClick = () => {
        navigate('/app/project/releases/create');
    }

    if (currentProject?.id === undefined) {
        // Redirect to dashboard
        navigate('/app/');
        return null;
    }

    return <>
        <PageContentWrapper>
            <PageTitle title={currentProject.name + " - All Release"}>
                <Button icon="lni-plus" onClick={handleNewReleaseClick}
                        type="primary" size="sm">New release</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col fullHeight sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardHeader title="What is a release?"/>
                                    <CardBody>
                                        <div className="d-flex x">
                                            <img className="w-75 mx-auto" src="/assets/releases.jpg" alt="notif"/>
                                        </div>
                                        <p>In <strong>TestGator</strong>, a <strong>release</strong> represents a
                                            specific version or milestone of a project that requires testing before
                                            deployment. Each release serves as a container for multiple <strong>testing
                                                plans</strong>, which are assigned to selected testers.</p>

                                        <p>These testing plans outline structured <strong>questions</strong>—feature
                                            scenarios that testers must follow and evaluate. Within a release, different
                                            testing plans can target various functionalities, user flows, or devices,
                                            allowing teams to validate multiple aspects of the software simultaneously.
                                        </p>

                                        <p>By organizing testing efforts into releases, developers can systematically
                                            track progress, collect structured feedback, and ensure that each iteration
                                            of the project meets quality expectations before moving forward.</p>

                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col fullHeight sm={12} xl={8}>
                        <Row className="h-100">
                            <Col fullHeight size={12}>
                                <ListReleases/>
                            </Col>
                        </Row>
                    </Col>
                </Row>

            </PageElementWrapper>
        </PageContentWrapper>
    </>
}
