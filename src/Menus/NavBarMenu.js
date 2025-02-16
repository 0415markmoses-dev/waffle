const NavBarMenu = [
    {
        title: 'Dashboard',
        url: '/app/',
        routes: ['app_dashboard'],
        icon: 'font-icon lni lni-dashboard-square-1',
    },
    {
        title: 'Project',
        url: '/app/project',
        routes: ['project_details'],
        icon: 'font-icon lni lni-box-closed',
    },
    {
        title: 'Testers list',
        routes: ['project_testers'],
        url: '/app/project/testers',
        icon: 'font-icon lni lni-user-multiple-4',
    },
    {
        title: 'Releases',
        icon: 'font-icon lni lni-git',
        children: [
            {
                title: 'View Releases',
                routes: ['project_releases', 'project_release_details'],
                url: '/app/project/releases',
            },
            {
                title: 'Create Release',
                routes: ['new_project_release'],
                url: '/app/project/releases/create',
            },
        ],
    },
    {
        title: 'Testing Plans',
        url: '/app/testing_plans',
        icon: 'font-icon lni lni-route-1',
        children: [
            {
                title: 'View Testing Plans',
                routes: ['project_testing_plans', 'project_testing_plan_details'],
                url: '/app/project/testing_plans',
            },
            {
                title: 'Create Testing Plans',
                routes: ['new_project_testing_plan'],
                url: '/app/project/testing_plans/create',
            },
        ],
    },
    {
        title: 'Parameters',
        url: '/settings',
        icon: 'font-icon lni lni-gear-1',
        children: [
            {
                title: 'Submenu 1',
                url: '/submenu1',
                icon: 'font-icon lni lni-home-2',
            },
            {
                title: 'Submenu 2',
                url: '/submenu2',
                icon: 'font-icon lni lni-home-2',
                children: [
                    {
                        title: 'Submenu 1',
                        url: '/submenu1',
                        icon: 'font-icon lni lni-home-2',
                    },
                    {
                        title: 'Submenu 2',
                        url: '/submenu2',
                        icon: 'font-icon lni lni-home-2',
                    }
                ]
            }
        ]
    },
    {
        title: 'About',
        url: '/app/about',
        routes: ['app_about'],
        icon: 'font-icon lni lni-heart',
    },
];

export default NavBarMenu;
