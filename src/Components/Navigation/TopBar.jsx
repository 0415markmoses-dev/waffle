import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {DropdownMenu} from "radix-ui";

export const TopBar = () => {
    const {currentProject, openSelectionModal} = useProjectStore();

    return (
        <div className="topbar">
            {/* Left — project selector */}
            <div className="topbar-left">
                <button className="topbar-project-btn" onClick={() => openSelectionModal()}>
                    <i className="font-icon lni lni-folder-1"></i>
                    <span className="topbar-project-name">
                        {currentProject?.name ?? "Select a project"}
                    </span>
                    <i className="font-icon lni lni-chevron-down topbar-project-chevron"></i>
                </button>
            </div>

            {/* Center — search */}
            <div className="topbar-center">
                <div className="topbar-search">
                    <i className="font-icon lni lni-search-1 topbar-search-icon"></i>
                    <input
                        type="text"
                        className="topbar-search-input"
                        placeholder="Search anything..."
                        readOnly
                    />
                    <kbd className="topbar-search-kbd">⌘K</kbd>
                </div>
            </div>

            {/* Right — notifications + settings */}
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
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <button className="topbar-icon-btn" aria-label="Settings">
                    <i className="font-icon lni lni-gear-1"></i>
                </button>
            </div>
        </div>
    );
};
