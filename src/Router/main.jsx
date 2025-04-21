import {createBrowserRouter} from "react-router-dom";
import {Login} from "../Pages/Login.jsx";
import {Layout as AppLayout} from "../Pages/app/layout.jsx";
import {Home} from "../Pages/app/Home.jsx";
import {matchRoutes, useLocation} from "react-router-dom"
import {Page as ProjectPage} from "../Pages/app/project/Page.jsx";
import {Page as ReleasesPage} from "../Pages/app/project/releases/Page.jsx";
import {Listing as ReleasesListing} from "../Pages/app/project/releases/Listing.jsx";
import {Create as ReleasesCreate} from "../Pages/app/project/releases/Create.jsx";
import {Page as TestingPlansPage} from "../Pages/app/project/testing_plans/Page.jsx";
import {Page as TestersPage} from "../Pages/app/project/testers/Page.jsx";
import {Page as AboutPage} from "../Pages/app/about/Page.jsx";
import {Create as QuestionsCreate} from "../Pages/app/project/questions/Create.jsx";


const formatRoutes = (routes, parents_ = []) => {
    routes.map(route => {
        let parents = [...parents_];
        if (route.children) {
            if (route.name !== undefined) {
                parents.push({
                    name: route.name,
                    path: route.path,
                });
            }
            route.children = formatRoutes(route.children, parents);
        }
        route.parents = parents_;
        return route;
    })
    return routes;
}


let routes = [
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
        path: "/app",
        element: <AppLayout/>,
        name: 'app_dashboard',
        children: [
            {
                path: "",
                name: 'app_dashboard',
                element: <Home/>,
            },
            {
                path: "about",
                name: 'app_about',
                element: <AboutPage/>,
            },
            {
                path: "project",
                name: 'project',
                children: [
                    {
                        path: "",
                        name: 'project_details',
                        element: <ProjectPage/>,
                    },
                    {
                        path: "testers",
                        name: 'project_testers',
                        element: <TestersPage/>,
                    },
                    {
                        path: "releases",
                        name: 'releases',
                        breadcrumb: false,
                        children: [
                            {
                                path: "",
                                name: 'project_releases',
                                element: <ReleasesListing/>,
                            },
                            {
                                path: "create",
                                name: 'new_project_release',
                                element: <ReleasesCreate/>,
                            },
                            {
                                path: ":rid",
                                name: 'project_release_details',
                                element: <ReleasesPage/>,
                            },
                        ],
                    },
                    {
                        path: "testing_plans",
                        name: 'testing_plans',
                        children: [
                            {
                                path: "",
                                name: 'project_testing_plans',
                                element: <TestingPlansPage/>,
                            },
                            {
                                path: "create",
                                name: 'new_project_testing_plan',
                                element: <TestingPlansPage/>,
                            },
                            {
                                path: ":tid",
                                name: 'project_testing_plan_details',
                                element: <TestingPlansPage/>,
                            },
                        ],
                    },
                    {
                        path: "questions",
                        name: 'questions',
                        breadcrumb: false,
                        children: [
                            {
                                path: "create",
                                name: 'new_project_questions',
                                element: <QuestionsCreate/>,
                            },
                        ],
                    },
                ]
            }
        ]
    },
];

routes = formatRoutes(routes);

export const router = createBrowserRouter(routes);

export const useCurrentPath = () => {
    const location = useLocation()
    let pathname = location.pathname;
    const routes_ = matchRoutes(routes, pathname);
    // todo debug auto breadcrumb
    //console.log('routes_', routes_);
    if (!routes_) return null;
    // get the latest route
    let match = routes_[routes_.length - 1]?.route;
    if (!match) return null;

    //console.log('match.parents', location, match.parents);

    // remove in match.parent the element that has the same name as match.name
    match.parents = match.parents.filter(parent => parent.name !== match.name || parent.breadcrumb === false);
    return match;
}
