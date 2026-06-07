const NavBarMenu = [
    {
        title: 'Dashboard',
        url: '/app/',
        routes: ['app_dashboard'],
        icon: 'font-icon lni lni-dashboard-square-1',
    },
    {
        title: 'Testers list',
        routes: ['project_testers'],
        url: '/app/project/testers',
        icon: 'font-icon lni lni-user-multiple-4',
    },
    {
        title: 'Releases',
        routes: ['project_releases', 'project_release_details', 'new_project_release'],
        url: '/app/project/releases',
        icon: 'font-icon lni lni-git',
    },
    {
        title: 'Testing Plans',
        routes: ['project_testing_plans', 'project_testing_plan_details', 'new_project_testing_plan'],
        url: '/app/project/testing_plans',
        icon: 'font-icon lni lni-route-1',
    },
    {
        title: 'About',
        url: '/app/about',
        routes: ['app_about'],
        icon: 'font-icon lni lni-heart',
    },
];

export default NavBarMenu;
