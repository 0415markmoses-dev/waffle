const TestingNavBarMenu = [
    {
        title: 'Dashboard',
        url: '/testing/',
        routes: ['testing_dashboard'],
        icon: 'font-icon lni lni-dashboard-square-1',
    },
    {
        title: 'My Plans',
        url: '/testing/plans',
        routes: ['testing_plans', 'testing_plan_details'],
        icon: 'font-icon lni lni-route-1',
    },
    {
        title: 'Archived Plans',
        url: '/testing/plans/archived',
        routes: ['testing_plans_archived'],
        icon: 'font-icon lni lni-box-archive-1',
    },
    {
        title: 'About',
        url: '/testing/about',
        routes: ['testing_about'],
        icon: 'font-icon lni lni-heart',
    },
];

export default TestingNavBarMenu;
