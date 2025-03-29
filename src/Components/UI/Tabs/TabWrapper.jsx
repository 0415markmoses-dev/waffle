import PropTypes from "prop-types";
import {TabsContext} from "./TabsContext.jsx";
import {useEffect, useState} from "react";

export const TabWrapper = ({
                               name = undefined,
                               onChange = () => {
                               },
                               inUrlParams = false,
                               children
                           }) => {
    const [id, setId] = useState('');
    const [activeTab, setActiveTab] = useState(undefined);
    // get all Tab components in children
    const tabs = children.filter(child => child.type.name === 'Tab');

    useEffect(() => {
        // get tab name, title and icon with index of active tab
        let myTab = tabs[activeTab];
        if (myTab === undefined) {
            onChange(undefined);
            return;
        }
        let payload = {
            name: myTab.props.name,
            title: myTab.props.title,
            icon: myTab.props.icon,
            index: activeTab,
        }
        onChange(payload);
        // if inUrlParams is true, add the tab name to the query string in form of name=${myTab.props.name}
        // if the param already exists, replace it
        // do not change other params
        // todo : do not use at the moment there is a bug that causes the tab to be set to the first tab independently of the query string
        if (inUrlParams) {
            let urlParams = new URLSearchParams(window.location.search);
            urlParams.set(name, myTab.props.name);
            let newUrl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + urlParams.toString();
            window.history.pushState({path: newUrl}, '', newUrl);
        }

    }, [activeTab])

    useEffect(() => {
        if (id === '') {
            setId('tab_wrapper_' + Math.random().toString(36).substring(2));
        }
    }, [id]);

    useEffect(() => {
        if (name === undefined) {
            return;
        }
        // get query string and search if there is a param with the name of the wrapper
        let urlParams = new URLSearchParams(window.location.search);
        let tabName = urlParams.get(name);
        if (tabName === null) {
            return;
        }
        let tab = tabs.find(tab => tab.props.name === tabName);
        if (tab !== undefined) {
            setActiveTab(tabs.indexOf(tab));
        }
    }, [name]);

    if (activeTab === undefined) {
        // get the first tab with props.active set to true
        let defaultActive = tabs.find(tab => tab.props.active === true);
        if (defaultActive !== undefined) {
            setActiveTab(tabs.indexOf(defaultActive));
        }
    }

    return <>
        <TabsContext value={{id: id, setId: setId, activeTab: activeTab, setActiveTab: setActiveTab}}>
            <div className="tab-spacer d-flex flex-column gap-lg">
                <ul id={id} className="nav nav-tabs">
                    {tabs.map((tab, index) => {
                        return <li key={id + '_' + index} className="nav-item heading">
                            <a className={`nav-link gap-sm ${(activeTab === index || (index === 0 && activeTab === undefined)) ? 'active' : ''}`}
                               href="#"
                               onClick={(e) => {
                                   e.preventDefault();
                                   setActiveTab(index);
                               }}>
                                {tab.props.icon !== '' && (
                                    <i className={`font-icon lni ${tab.props.icon}`}></i>
                                )}
                                <span className="tab-label">{tab.props.title}</span>
                            </a>
                        </li>
                    })}
                </ul>
                {tabs.map((tab, index) => {
                    return <div key={id + '_' + index}
                                className={`tab-pane ${activeTab === index || (index === 0 && activeTab === undefined) ? 'd-block' : 'd-none'}`}>
                        {tab}
                    </div>
                })}
            </div>

        </TabsContext>
    </>
}

TabWrapper.propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    inUrlParams: PropTypes.bool,
    children: PropTypes.node
}
