import {Accordion} from "radix-ui";
import PropTypes from "prop-types";
import {MenuLink} from "./MenuLink.jsx";

export const MenuBuilderGroup = ({
                                     data = [],
                                     index_ = 0,
                                 }) => {

    //console.log('MenuBuilderGroup::data', data, index_);
    let classCss = '';
    let value = 'item-' + index_;
    let defaultValue = '';

    if (data.active) {
        classCss += ' active ';
        defaultValue = value;
    }

    return <>
        {data.children !== undefined && data.children.length > 0
            ? (
                <>
                    <Accordion.Root
                        className="navbar-menu-item-group"
                        type="multiple"
                        defaultValue={defaultValue}
                        collapsible="true">
                        <Accordion.Item className="navbar-menu-group-container"
                                        data-state={data.active ? 'open' : 'closed'}
                                        value={value}>
                            <Accordion.Trigger className={"navbar-menu-group-label gap-sm" + classCss}>
                                {data.icon !== undefined && (
                                    <div className="navbar-item-icon-wrapper">
                                        <i className={data.icon}></i>
                                    </div>
                                )}
                                <div className="navbar-item-text">
                                    {data.title}
                                </div>
                            </Accordion.Trigger>
                            <Accordion.Content className="AccordionContent">
                                {data.children.map((child, childIndex) => {
                                    return <MenuBuilderGroup key={'menubuildergroupss' + childIndex}
                                                             data={child} index={childIndex}/>
                                })}
                            </Accordion.Content>
                        </Accordion.Item>
                    </Accordion.Root>
                </>
            ) : (
                <MenuLink to={data.url} className={"navbar-menu-item gap-sm" + classCss}>
                    {data.icon !== undefined && (
                        <div className="navbar-item-icon-wrapper">
                            <i className={data.icon}></i>
                        </div>
                    )}
                    <div className="navbar-item-text">
                        {data.title}
                    </div>
                </MenuLink>
            )}

    </>
}


MenuBuilderGroup.propTypes = {
    data: PropTypes.array,
    index_: PropTypes.number,
}
