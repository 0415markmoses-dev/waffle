import {PageContentWrapper} from "../../Components/Navigation/PageContentWrapper.jsx";
import {PageTitle} from "../../Components/Navigation/PageTitle.jsx";
import {PageElementWrapper} from "../../Components/Navigation/PageElementWrapper.jsx";
import {Button} from "../../Components/UI/Buttons/Button.jsx";
import {Row} from "../../Components/UI/Grid/Row.jsx";
import {Col} from "../../Components/UI/Grid/Col.jsx";
import {Card} from "../../Components/UI/Card/Card.jsx";
import {CardBody} from "../../Components/UI/Card/CardBody.jsx";
import {CardHeader} from "../../Components/UI/Card/CardHeader.jsx";
import {CardFooter} from "../../Components/UI/Card/CardFooter.jsx";
import ProjectService from "../../Services/PrivateApi/ProjectService.js";
import {useEffect, useState} from "react";
import TestPlansService from "../../Services/PrivateApi/TestPlansService.js";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {SingleMetricDisplay} from "../../Components/UI/Metrics/SingleMetricDisplay.jsx";
import {MetricVerticalSeparator} from "../../Components/UI/Metrics/MetricVerticalSeparator.jsx";
import {TestPlanDisplayCard} from "../../Components/TestPlans/TestPlanDisplayCard.jsx";
import {ErrorState} from "../../Components/UI/ErrorState.jsx";
import {Loader} from "../../Components/UI/Loader.jsx";

export const Home = () => {
    const {currentProject} = useProjectStore();
    const [projects, setProjects] = useState([]);
    const [testPlans, setTestPlans] = useState([]);
    const [loadingTestPlans, setLoadingTestPlans] = useState(false);
    useEffect(() => {
        ProjectService.getProjects()
            .then((response) => {
                if (response.data['member'] !== undefined) {
                    setProjects(response.data['member']);
                }
            });
    }, []);

    useEffect(() => {
        setTestPlans([]);
        setLoadingTestPlans(true);
        TestPlansService.getTestPlans({
            'order[dueDate]': 'asc', // most urgent first
            'state': ['published'], // draft, published, archived
            'release.project': currentProject?.id,
            limit: 5
        })
            .then((response) => {
                if (response.data['member'] !== undefined) {
                    setTestPlans(response.data['member']);
                }
            })
            .finally(() => setLoadingTestPlans(false))
        ;
    }, [currentProject?.id]);

    let otherProjects = projects;
    if (currentProject?.id !== undefined) {
        otherProjects = projects.filter(project => project.id !== currentProject.id);
    }

    let currentTestPlans = [];
    if (currentProject !== null) {
        currentTestPlans = testPlans;
    }


    return <>
        <PageContentWrapper>
            <PageTitle title="TestGator Dashboard">
                <Button icon="lni-sliders-horizontal-square-2"
                        type="light" size="sm">Petit button</Button>
                <Button type="light" size="sm">Petit button</Button>
            </PageTitle>
            <PageElementWrapper>
                <Row>
                    <Col sm={12} xl={4}>
                        <Row>
                            <Col>
                                <Card>
                                    <CardBody>
                                        {currentProject !== null && (
                                            <div
                                                className="w-100 d-flex flex-row gap-lg align-items-center justify-content-around position-relative">
                                                <SingleMetricDisplay
                                                    label={currentProject.totalReleases > 1 ? 'Releases' : 'Release'}
                                                    value={currentProject.totalReleases}/>
                                                <MetricVerticalSeparator/>
                                                <SingleMetricDisplay
                                                    label={currentProject.totalTesters > 1 ? 'Testers' : 'Tester'}
                                                    value={currentProject.totalTesters}/>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col>
                                <Card>
                                    <CardHeader title="About"/>
                                    <CardBody>
                                        {currentProject !== null && (
                                            <div className="w-100 d-flex flex-column gap-lg">
                                                <div className="d-flex justify-content-center align-items-center">
                                                    <div className="project-picture-wrapper size-lg">
                                                        <img src="/assets/gator_avatar.png" alt=""/>
                                                    </div>
                                                </div>
                                                <div className="w-100 d-flex flex-column gap-sm">
                                                    <p className="m-0">{currentProject.description}</p>
                                                    <ul className="list-unstyled m-0">
                                                        <li>
                                                            <b>Latest release
                                                                : </b> {currentProject.latestRelease ? currentProject.latestRelease : 'No release yet'}
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col>
                                <Card>
                                    <CardHeader title="Other projects"/>
                                    <CardBody>
                                        <div className="d-flex flex-column gap-lg">
                                            {otherProjects.map((project, index) => {
                                                return <div className="d-flex gap-md" key={index}>
                                                    <div
                                                        className="project-meta flex-grow-0 d-flex justify-content-end align-items-center">
                                                        <div className="project-picture-wrapper size-sm">
                                                            <img src="/assets/gator_avatar.png" alt=""/>
                                                        </div>
                                                    </div>
                                                    <div className="project-content d-flex flex-column gap-sm">
                                                        <a className="m-0" href="#">
                                                            <b>#{project.id} - {project.name}</b>
                                                        </a>
                                                        <p className="m-0 small">{project.description}</p>
                                                        <div className="w-100 m-0 d-flex gap-sm">
                                                            <div className="badge bg-info heading super-small">
                                                                {project.totalReleases >= 1 ? (
                                                                    <>
                                                                        {project.totalReleases} Releases
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {project.totalReleases} Release
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div
                                                                className="badge bg-light text-muted heading super-small">
                                                                {project.totalTesters >= 1 ? (
                                                                    <>
                                                                        {project.totalTesters} Testers
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {project.totalTesters} Tester
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            })}
                                        </div>
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
                                                    Unlock productivity with
                                                    TestGator workflow
                                                </h2>
                                                <p>
                                                    Welcome to TestGator! Track testing progress, manage participants,
                                                    and
                                                    analyze results effortlessly. Gain insights from real user
                                                    environments to
                                                    streamline your software testing process.
                                                </p>
                                            </div>
                                            <div className="d-flex x">
                                                <img className="w-100" src="/assets/getting_started.jpg" alt="notif"/>
                                            </div>
                                        </div>

                                    </CardBody>
                                    <CardFooter>
                                        <Button icon="lni-link-2-angular-right" type="link" size="sm">View
                                            Documentation</Button>
                                    </CardFooter>
                                </Card>
                            </Col>
                            <Col size={12}>
                                <Card>
                                    <CardHeader title="Latest testing plans">
                                        <Button type="link" size="sm">View
                                            All</Button>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="w-100 d-flex flex-column gap-lg">
                                            {loadingTestPlans && (
                                                <Loader/>
                                            )}
                                            {currentTestPlans.length === 0 && !loadingTestPlans && (
                                                <ErrorState message="No testing plans found for this project"/>
                                            )}
                                            {currentTestPlans.map((testPlan, index) => {
                                                return <TestPlanDisplayCard isCard={false}
                                                                            disabled={testPlan.state === 'archived'}
                                                                            testPlan={testPlan} key={index}/>
                                            })}
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>

                    </Col>
                </Row>
            </PageElementWrapper>
        </PageContentWrapper>
    </>
}
