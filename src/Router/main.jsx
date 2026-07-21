import {createBrowserRouter, matchRoutes, useLocation} from "react-router-dom";
import {Login} from "../Pages/Login.jsx";
import {ProtectedRoute, TestingRoute} from "./RouteGuards.jsx";
import {Home} from "../Pages/app/Home.jsx";
import {Home as TestingHome} from "../Pages/testing/Home.jsx";
import {PlanDetail as TestingPlanDetail} from "../Pages/testing/PlanDetail.jsx";
import {ArchivedPlans as TestingArchivedPlans} from "../Pages/testing/ArchivedPlans.jsx";
import {About as TestingAbout} from "../Pages/testing/About.jsx";
import {Page as ReleasesPage} from "../Pages/app/project/releases/Page.jsx";
import {Listing as ReleasesListing} from "../Pages/app/project/releases/Listing.jsx";
import {Create as ReleasesCreate} from "../Pages/app/project/releases/Create.jsx";
import {Page as TestingPlansPage} from "../Pages/app/project/testing_plans/Page.jsx";
import {Listing as TestingPlansListing} from "../Pages/app/project/testing_plans/Listing.jsx";
import {Page as TestersPage} from "../Pages/app/project/testers/Page.jsx";
import {TesterProfile} from "../Pages/app/project/testers/TesterProfile.jsx";
import {Page as AboutPage} from "../Pages/app/about/Page.jsx";
import {Page as ProjectPage} from "../Pages/app/project/Page.jsx";
import {Create as QuestionsCreate} from "../Pages/app/project/questions/Create.jsx";
import {Page as QuestionPage} from "../Pages/app/project/questions/Page.jsx";
import {Page as AnswerPage} from "../Pages/app/project/answers/Page.jsx";
import {LoaderPlayground} from "../Pages/app/dev/LoaderPlayground.jsx";


// Routes that have a `label` appear in the breadcrumb trail.
// Routes with `breadcrumb: false` are skipped entirely (but their children still appear).
// Layout-only routes (AppLayout) get no label and are therefore invisible to breadcrumbs.
export const routes = [
    {
        path: "/login",
        name: 'login',
        element: <Login/>,
    },
    {
        path: "/",
        name: 'login',
        element: <Login/>,
    },
    {
        path: "/testing",
        element: <TestingRoute/>,
        children: [
            {
                path: "",
                name: 'testing_dashboard',
                label: 'Dashboard',
                element: <TestingHome/>,
            },
            {
                path: "plans",
                name: 'testing_plans',
                label: 'My Plans',
                element: <TestingHome/>,
            },
            {
                path: "plans/archived",
                name: 'testing_plans_archived',
                label: 'Archived Plans',
                element: <TestingArchivedPlans/>,
            },
            {
                path: "plans/:id",
                name: 'testing_plan_detail',
                label: 'Plan',
                element: <TestingPlanDetail/>,
            },
            {
                path: "about",
                name: 'testing_about',
                label: 'About',
                element: <TestingAbout/>,
            },
        ],
    },
    // we will have a separate set of page for testers under /testing...
    // everything under /app... is protected and only accessible for dev team
    {
        path: "/app",
        element: <ProtectedRoute/>,
        // no label — layout wrapper, not a real page
        children: [
            {
                path: "",
                name: 'app_dashboard',
                label: 'Dashboard',
                element: <Home/>,
            },
            {
                path: "about",
                name: 'app_about',
                label: 'About',
                element: <AboutPage/>,
            },
            {
                path: "dev/loader",
                name: 'dev_loader_playground',
                label: 'Loader Playground',
                element: <LoaderPlayground/>,
            },
            {
                path: "project-settings",
                name: 'project_settings',
                label: 'Project',
                element: <ProjectPage/>,
            },
            {
                path: "project",
                name: 'project',
                breadcrumb: false,
                children: [
                    {
                        path: "testers",
                        name: 'project_testers',
                        label: 'Testers',
                        children: [
                            {
                                path: "",
                                name: 'project_testers_list',
                                element: <TestersPage/>,
                            },
                            {
                                path: ":testerId",
                                name: 'project_tester_profile',
                                label: 'Tester',
                                element: <TesterProfile/>,
                            },
                        ],
                    },
                    {
                        path: "releases",
                        name: 'releases',
                        label: 'Releases',  // appears as parent crumb for /releases/:rid
                        children: [
                            {
                                path: "",
                                name: 'project_releases',
                                // no label — this IS the Releases page, no need to double-up
                                element: <ReleasesListing/>,
                            },
                            {
                                path: "create",
                                name: 'new_project_release',
                                label: 'New Release',
                                element: <ReleasesCreate/>,
                            },
                            {
                                path: ":rid",
                                name: 'project_release_details',
                                label: 'Release',  // static fallback; overridden by breadcrumbLabel on the page
                                element: <ReleasesPage/>,
                            },
                        ],
                    },
                    {
                        path: "testing_plans",
                        name: 'testing_plans',
                        label: 'Test Plans',
                        children: [
                            {
                                path: "",
                                name: 'project_testing_plans',
                                // no label — this IS the Test Plans listing
                                element: <TestingPlansListing/>,
                            },
                            {
                                path: "create",
                                name: 'new_project_testing_plan',
                                label: 'New Plan',
                                element: <TestingPlansPage/>,
                            },
                            {
                                path: ":tid",
                                name: 'project_testing_plan_details',
                                label: 'Plan',  // static fallback; overridden by breadcrumbLabel on the page
                                element: <TestingPlansPage/>,
                            },
                        ],
                    },
                    {
                        path: "questions",
                        name: 'questions',
                        label: 'Questions',
                        children: [
                            {
                                path: "create",
                                name: 'new_project_questions',
                                label: 'New Question',
                                element: <QuestionsCreate/>,
                            },
                            {
                                path: ":qid",
                                name: 'project_question_details',
                                label: 'Question',
                                element: <QuestionPage/>,
                            },
                        ],
                    },
                    {
                        path: "answers",
                        name: 'answers',
                        breadcrumb: false,
                        children: [
                            {
                                path: ":id",
                                name: 'project_answer_details',
                                label: 'Answer',
                                element: <AnswerPage/>,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const router = createBrowserRouter(routes);

/**
 * Returns the current route's label + an ordered list of parent breadcrumb entries.
 * Uses matchRoutes so absolute paths come for free — no manual path building needed.
 */
export const useCurrentPath = () => {
    const location = useLocation();
    const matches = matchRoutes(routes, location.pathname);
    if (!matches) return null;

    // Keep only segments that have a label AND are not explicitly excluded
    const visible = matches.filter(
        m => m.route.label !== undefined && m.route.breadcrumb !== false
    );

    if (visible.length === 0) return null;

    const current = visible[visible.length - 1];
    const parents = visible.slice(0, -1).map(m => ({
        name: m.route.name,
        label: m.route.label,
        path: m.pathname,  // absolute path — correct for NavLink
    }));

    return {
        name: current.route.name,
        label: current.route.label,
        path: current.pathname,
        parents,
    };
};
