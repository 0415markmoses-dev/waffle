import PropTypes from "prop-types";
import NavBarMenu from "../../Menus/NavBarMenu";
import TestingNavBarMenu from "../../Menus/TestingNavBarMenu";
import {MenuBuilderGroup} from "./MenuBuilderGroup.jsx";
import {useCurrentPath} from "../../Router/main.jsx";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";

export const MenuBuilder = ({
                                name = '',
                            }) => {
    const useCurrentPath_ = useCurrentPath();
    const {currentProjectId} = useProjectStore();

    let data = {};
    switch (name) {
        case 'navbar':
            data = NavBarMenu;
            break;
        case 'testing-navbar':
            data = TestingNavBarMenu;
            break;
        default:
            return '';
    }

    const vars = {
        currentProjectId: currentProjectId
    }

    const checkActive = (element) => {
        element.active = false;
        // replace {var} in element.url
        if (element.url !== undefined) {
            Object.keys(vars).map((key) => {
                element.url = element.url.replace('{' + key + '}', vars[key]);
            });
        }

        let hasActive = false;
        if (element.routes !== undefined && element.routes.includes(useCurrentPath_?.name)) {
            element.active = true;
            hasActive = true;
        } else if (element.children !== undefined) {
            let hasChildrenActive = false;
            element.children.map((child) => {
                const {element, hasActive} = checkActive(child);
                if (hasActive) {
                    hasChildrenActive = true;
                }
                return element;
            });
            if (hasChildrenActive) {
                //console.log('MenuBuilder::checkActive::hasChildrenActive', element);
                element.active = true;
                hasActive = true;
            }
        }
        return {element, hasActive};
    }

    // check if uri is active, if one is active, set all the parents active
    data.map((element) => {
        const {element: element_} = checkActive(element);
        return element_;
    });

    //console.log('MenuBuilder::data_parsed', data);


    return <>
        <div className="menu-builder-wrapper gap-md">
            {data.map((item, index) => {
                return <MenuBuilderGroup key={'menubuildergroup__' + item.url} data={item} index={index}/>
            })}
        </div>

    </>
}


MenuBuilder.propTypes = {
    name: PropTypes.string,
}
