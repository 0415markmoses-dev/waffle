import {useEffect, useState} from 'react';
import {useTranslation} from "react-i18next";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useGetCurrentProject} from "../../Hooks/Projects/useGetCurrentProject.js";
import {useAuthStore, isTester} from "../../Store/auth.js";
import {DropdownMenu} from "radix-ui";
import {SearchModal} from "../Search/SearchModal.jsx";
import {useAdminModalStore} from "../../Store/UI/adminModalStore.js";

export const TopBar = () => {
    const {t} = useTranslation();
    const {openSelectionModal} = useProjectStore();
    const {project: currentProject} = useGetCurrentProject();
    const {user} = useAuthStore();
    const tester = isTester(user);
    const [searchOpen, setSearchOpen] = useState(false);
    const {open: openAdmin} = useAdminModalStore();

    // ⌘K / Ctrl+K global shortcut
    useEffect(() => {
        const handleKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <>
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)}/>
        <div className="topbar">
            {/* Left — project selector (team only) */}
            <div className="topbar-left">
                {!tester && (
                    <button className="topbar-project-btn" onClick={() => openSelectionModal()}>
                        <i className="font-icon lni lni-folder-1"></i>
                        <span className="topbar-project-name">
                            {currentProject?.name ?? "Select a project"}
                        </span>
                        <i className="font-icon lni lni-chevron-down topbar-project-chevron"></i>
                    </button>
                )}
            </div>

            {/* Center — search */}
            <div className="topbar-center">
                <div className="topbar-search" onClick={() => setSearchOpen(true)}>
                    <i className="font-icon lni lni-search-1 topbar-search-icon"></i>
                    <input
                        type="text"
                        className="topbar-search-input"
                        placeholder={t('Search anything…')}
                        readOnly
                    />
                    <kbd className="topbar-search-kbd">⌘K</kbd>
                </div>
            </div>

            {/* Right — notifications + help/settings */}
            <div className="topbar-right">
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="topbar-icon-btn" aria-label="Notifications">
                            <i className="font-icon lni lni-bell-1"></i>
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            side="bottom"
                            align="end"
                            sideOffset={8}
                            className="dropdown-content topbar-notifications-dropdown"
                        >
                            <div className="topbar-notif-header">
                                <span className="heading">Notifications</span>
                            </div>
                            <div className="topbar-notif-empty">
                                <i className="font-icon lni lni-bell-1"></i>
                                <span>No notifications</span>
                            </div>
                            <div className="topbar-notif-footer">
                                <span className="badge bg-secondary">Upcoming feature</span>
                            </div>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                {tester ? (
                    <button className="topbar-icon-btn" aria-label="Help">
                        <i className="font-icon lni lni-question-mark-circle"></i>
                    </button>
                ) : (
                    <button className="topbar-icon-btn" aria-label="Settings" onClick={openAdmin}>
                        <i className="font-icon lni lni-gear-1"></i>
                    </button>
                )}
            </div>
        </div>
        </>
    );
};
