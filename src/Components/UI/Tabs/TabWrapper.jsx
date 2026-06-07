import PropTypes from "prop-types";
import {TabsContext} from "./TabsContext.jsx";
import {useEffect, useId, useState} from "react";
import {useSearchParams} from "react-router";

export const TabWrapper = ({
                               name = undefined,
                               onChange = () => {
                               },
                               inUrlParams = false,
                               children
                           }) => {
    const uid = useId();
    const tabs = children.filter(child => child.type.name === 'Tab');

    // ── URL-backed mode ───────────────────────────────────────────────────────
    const [searchParams, setSearchParams] = useSearchParams();

    const defaultIndex = (() => {
        if (inUrlParams && name) {
            const paramValue = searchParams.get(name);
            if (paramValue) {
                const idx = tabs.findIndex(t => t.props.name === paramValue);
                if (idx !== -1) return idx;
            }
        }
        const activeIdx = tabs.findIndex(t => t.props.active === true);
        return activeIdx !== -1 ? activeIdx : 0;
    })();

    // ── Local mode ────────────────────────────────────────────────────────────
    const [localTab, setLocalTab] = useState(defaultIndex);

    // When inUrlParams, derive active index from URL; otherwise use local state
    const activeTab = inUrlParams && name
        ? (() => {
            const paramValue = searchParams.get(name);
            if (paramValue) {
                const idx = tabs.findIndex(t => t.props.name === paramValue);
                if (idx !== -1) return idx;
            }
            return defaultIndex;
        })()
        : localTab;

    const handleSelect = (index) => {
        if (inUrlParams && name) {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                next.set(name, tabs[index].props.name);
                return next;
            }, {replace: false});
        } else {
            setLocalTab(index);
        }
    };

    // Fire onChange when active tab changes
    useEffect(() => {
        const myTab = tabs[activeTab];
        if (!myTab) {
            onChange(undefined);
            return;
        }
        onChange({name: myTab.props.name, title: myTab.props.title, icon: myTab.props.icon, index: activeTab});
    }, [activeTab]);

    return (
        <TabsContext value={{id: uid, activeTab, setActiveTab: handleSelect}}>
            <div className="tab-spacer d-flex flex-column gap-lg">
                <ul id={uid} className="nav nav-tabs">
                    {tabs.map((tab, index) => (
                        <li key={uid + '_' + index} className="nav-item">
                            <a
                                className={`nav-link gap-sm ${activeTab === index ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleSelect(index);
                                }}
                            >
                                {tab.props.icon !== '' && (
                                    <i className={`font-icon lni ${tab.props.icon}`}/>
                                )}
                                <span className="tab-label">{tab.props.title}</span>
                                {tab.props.badge !== undefined && (
                                    <span className="badge tab-badge ms-1">{tab.props.badge}</span>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>
                {tabs.map((tab, index) => (
                    <div
                        key={uid + '_' + index}
                        className={`tab-pane ${activeTab === index ? 'd-block' : 'd-none'}`}
                    >
                        {tab}
                    </div>
                ))}
            </div>
        </TabsContext>
    );
};

TabWrapper.propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    inUrlParams: PropTypes.bool,
    children: PropTypes.node,
};
