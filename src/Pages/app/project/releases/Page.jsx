import {PageTitle} from "../../../../Components/Navigation/PageTitle.jsx";
import {Button} from "../../../../Components/UI/Buttons/Button.jsx";
import {PageContentWrapper} from "../../../../Components/Navigation/PageContentWrapper.jsx";
import {useNavigate, useParams} from "react-router";
import {useProjectStore} from "../../../../Store/PrivateData/ProjectsStore.js";
import {PageElementWrapper} from "../../../../Components/Navigation/PageElementWrapper.jsx";
import {Row} from "../../../../Components/UI/Grid/Row.jsx";
import {Col} from "../../../../Components/UI/Grid/Col.jsx";
import {Card} from "../../../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../../../Components/UI/Card/CardBody.jsx";
import {CardFooter} from "../../../../Components/UI/Card/CardFooter.jsx";
import {useEffect, useState} from "react";
import ReleasesService from "../../../../Services/PrivateApi/ReleasesService.js";
import {Loader} from "../../../../Components/UI/Loader.jsx";
import {Error404} from "../../../../Components/UI/Error404.jsx";

export const Page = () => {
    let navigate = useNavigate();
    let params = useParams()
    const {currentProject} = useProjectStore();
    const [pageStatus, setPageStatus] = useState(200);
    const [releaseData, setReleaseData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        ReleasesService.getRelease(params.rid)
            .then(response => {
                if (response?.data?.id !== undefined) {
                    setReleaseData(response.data);
                    return;
                }
                throw new Error('No data found');
            })
            .catch(err => {
                setReleaseData([]);
                setPageStatus(404);
                console.error(err);
            })
            .finally(() => setLoading(false))

    }, [params.rid])


    if (currentProject?.id === undefined) {
        // Redirect to dashboard
        navigate('/app/');
        return null;
    }

    if (pageStatus !== 200) {
        return <Error404 goBackUrl="/app/project/releases"
                         message={'Gator could not find this Release... Maybe try to look elsewhere.'}/>
    }

    return <>
        <PageContentWrapper>
            <PageTitle title={currentProject.name + " - Release " + (releaseData?.name ? releaseData?.name : '')}>
                <Button icon="lni-plus"
                        type="light" size="sm">New release</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        {loading && <Loader/>}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                    <Col sm={12} xl={8}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        <div className="w-100 d-flex justify-content-between gap-md align-items-center">
                                            <div className="d-flex flex-column">
                                                <h2>
                                                    How to use Releases in
                                                    TestGator
                                                </h2>
                                                <p>
                                                    In <strong>TestGator</strong>, a <strong>release</strong> is a
                                                    milestone containing multiple <strong>testing plans</strong>.
                                                    Testers follow structured <strong>questions</strong>, give feedback,
                                                    and ensure quality before deployment.
                                                    Track progress, collect insights, and refine each version
                                                    efficiently.
                                                </p>
                                            </div>
                                            <div className="d-flex x">
                                                <img className="w-100 horizontal-flip-img" src="/assets/releases.jpg"
                                                     alt="notif"/>
                                            </div>
                                        </div>

                                    </CardBody>
                                    <CardFooter>
                                        <Button icon="lni-link-2-angular-right" type="link" size="sm">View
                                            Documentation</Button>
                                    </CardFooter>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </PageElementWrapper>
        </PageContentWrapper>
    </>
}
