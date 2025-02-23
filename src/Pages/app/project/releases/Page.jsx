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
import {Error404} from "../../../../Components/UI/Error404.jsx";
import {SingleMetricDisplay} from "../../../../Components/UI/Metrics/SingleMetricDisplay.jsx";
import {MetricVerticalSeparator} from "../../../../Components/UI/Metrics/MetricVerticalSeparator.jsx";
import {ProgressBar} from "../../../../Components/UI/Metrics/ProgressBar.jsx";
import {CardHeader} from "../../../../Components/UI/Card/CardHeader.jsx";
import {CardGroup} from "../../../../Components/UI/Card/CardGroup.jsx";
import {EditReleaseForm} from "../../../../Components/Releases/EditReleaseForm.jsx";
import {ReleaseDescription} from "../../../../Components/Releases/ReleaseDescription.jsx";

export const Page = () => {
    let navigate = useNavigate();
    let params = useParams()
    const {currentProject} = useProjectStore();
    const [pageStatus, setPageStatus] = useState(200);
    const [releaseData, setReleaseData] = useState([]);
    const [releaseStats, setReleaseStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const loadReleaseStats = () => {
        setReleaseStats([]);
        ReleasesService.getReleaseStats(params.rid)
            .then(response => {
                if (response?.data?.id !== undefined) {
                    setReleaseStats(response.data);
                    return;
                }
                throw new Error('No data found');
            })
            .catch(err => {
                setReleaseStats([]);
                console.error(err);
            })
        ;
    }

    const loadReleaseData = () => {
        setLoading(true);
        ReleasesService.getRelease(params.rid)
            .then(response => {
                if (response?.data?.id !== undefined) {
                    if (currentProject.id !== response.data?.project?.id) {
                        throw new Error('Project mismatch');
                    }
                    setReleaseData(response.data);
                    loadReleaseStats();
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
    }

    useEffect(() => {
        loadReleaseData();
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
                        type="primary" size="sm">New testing plan</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        {!loading && (
                                            <>
                                                <div className="w-100 d-flex flex-column gap-lg">
                                                    <div
                                                        className="w-100 d-flex flex-row gap-lg align-items-center justify-content-around position-relative">
                                                        <SingleMetricDisplay
                                                            label={releaseStats.totalPlans > 1 ? 'Plans' : 'Plan'}
                                                            value={releaseStats.totalPlans}/>
                                                        <MetricVerticalSeparator/>
                                                        <SingleMetricDisplay
                                                            label={releaseStats.totalQuestions > 1 ? 'Scenarios' : 'Scenario'}
                                                            value={releaseStats.totalQuestions}/>
                                                        <MetricVerticalSeparator/>
                                                        <SingleMetricDisplay
                                                            label={releaseStats.totalResponded > 1 ? 'Responses' : 'Response'}
                                                            value={releaseStats.totalResponded}/>
                                                    </div>
                                                    <div className="w-100">
                                                        <ProgressBar value={releaseStats.percentage}/>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <CardHeader title="Manage your release"/>
                                    <CardGroup className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-column">
                                            <div className="heading">Edit</div>
                                            <div className="text-muted small">
                                                Edit the release details
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <Button onClick={() => {
                                                setEditMode(!editMode)
                                            }} iconOnly type="light" size="sm">
                                                <i className="font-icon lni lni-pencil-1"></i>
                                            </Button>
                                        </div>
                                    </CardGroup>
                                    <CardGroup className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex flex-column">
                                            <div className="heading">Download</div>
                                            <div className="text-muted small">
                                                Get the testing details in CSV
                                            </div>
                                        </div>
                                        <div className="d-flex flex-column">
                                            <Button iconOnly type="light" size="sm">
                                                <i className="font-icon lni lni-download-1"></i>
                                            </Button>
                                        </div>
                                    </CardGroup>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <CardBody>
                                        <div
                                            className="w-100 d-flex flex-column justify-content-between gap-md align-items-center">
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
                    <Col sm={12} xl={8}>
                        <Row>
                            <Col>
                                <Card>
                                    {editMode && !loading && (
                                        <CardBody>
                                            <EditReleaseForm
                                                onCancel={() => setEditMode(false)}
                                                onUpdate={() => {
                                                    setEditMode(false);
                                                    loadReleaseData();
                                                }}
                                                release={releaseData}/>
                                        </CardBody>
                                    )}

                                    {!editMode && (
                                        <>
                                            <CardHeader title={releaseData?.name}/>
                                            <CardBody>
                                                <div className="release-description">
                                                    <ReleaseDescription description={releaseData?.description}/>
                                                </div>
                                            </CardBody>
                                        </>
                                    )}

                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </PageElementWrapper>
        </PageContentWrapper>
    </>
}
