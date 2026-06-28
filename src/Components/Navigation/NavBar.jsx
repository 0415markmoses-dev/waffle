import {NavLink} from "react-router-dom";
import {useState} from "react";
import {useAuthStore} from "../../store/auth.js";
import {useNavigate} from "react-router";
import {MenuBuilder} from "./MenuBuilder.jsx";
import {DropdownMenu} from "radix-ui";
import {UserSettingsModal} from "../User/UserSettingsModal.jsx";
import {AdminModal} from "../Admin/AdminModal.jsx";
import {useTranslation} from "react-i18next";
import {useAdminModalStore} from "../../Store/UI/adminModalStore.js";


export const NavBar = ({menuName = 'navbar'}) => {
    const {t} = useTranslation();
    let navigate = useNavigate();
    const {user, clearUserData} = useAuthStore();
    const [settingsTab, setSettingsTab] = useState(null); // null = closed
    const {isOpen: adminOpen, open: openAdmin, close: closeAdmin} = useAdminModalStore();

    const onLogout = (e) => {
        e?.preventDefault();
        clearUserData();
        navigate("/");
    };

    const openSettings = (tab) => setSettingsTab(tab);
    const closeSettings = () => setSettingsTab(null);

    const isAdmin = user?.roles?.includes('ROLE_ADMIN');
    const displayName = user?.nickname ?? user?.name ?? user?.email ?? 'User';
    const avatarSrc = user?.profilePictureUrl ?? '/assets/fake_user.jpg';

    return (
        <>
            <nav className="navbar-app flex-grow-0 h-100">
                <div className="w-100 navbar-container d-flex flex-column gap-md">
                    <div className="navbar-brand pt-4">
                        <NavLink className="navbar-brand-link gap-md" to="/" end>
                            <div className="project-picture-wrapper">
                                <img src="/assets/gator_avatar.png" alt=""/>
                            </div>
                        </NavLink>
                    </div>

                    <div className="navbar-menu">
                        <MenuBuilder name={menuName}/>
                    </div>

                    {user !== null && (
                        <div className="navbar-profile">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger className="profile-trigger">
                                    <div className="profile-avatar flex-shrink-0">
                                        <img src={avatarSrc} alt={displayName}/>
                                    </div>
                                    <div className="d-flex flex-column overflow-hidden">
                                        <span className="profile-trigger-name">{displayName}</span>
                                        {user.email &&
                                            <span className="profile-trigger-email text-truncate">{user.email}</span>}
                                    </div>
                                    <i className="font-icon lni lni-chevron-down profile-trigger-chevron"></i>
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        side="top"
                                        align="start"
                                        sideOffset={10}
                                        className="dropdown-content"
                                    >
                                        <div className="dropdown-item dropdown-user-header">
                                            <div className="profile-avatar me-2 flex-shrink-0">
                                                <img src={avatarSrc} alt={displayName}/>
                                            </div>
                                            <div
                                                className="flex-grow-1 d-flex flex-column justify-content-start overflow-hidden">
                                                <small className="opacity-50">{t('Connected as')}</small>
                                                {user.nickname &&
                                                    <div className="fw-semibold text-truncate">{user.nickname}</div>}
                                                <div className="text-truncate opacity-75"
                                                     style={{fontSize: '.8em'}}>{user.email}</div>
                                            </div>
                                        </div>

                                        <DropdownMenu.Separator className="dropdown-separator"/>

                                        <DropdownMenu.Item asChild>
                                            <button className="dropdown-action-item"
                                                    onClick={() => openSettings('profile')}>
                                                <i className="font-icon lni lni-user-4"></i>
                                                {t('Profile')}
                                            </button>
                                        </DropdownMenu.Item>

                                        <DropdownMenu.Item asChild>
                                            <button className="dropdown-action-item"
                                                    onClick={() => openSettings('security')}>
                                                <i className="font-icon lni lni-locked-1"></i>
                                                {t('Security')}
                                            </button>
                                        </DropdownMenu.Item>

                                        {isAdmin && (
                                            <DropdownMenu.Item asChild>
                                                <button className="dropdown-action-item dropdown-action-item--admin"
                                                        onClick={() => openAdmin()}>
                                                    <i className="font-icon lni lni-gear-1"></i>
                                                    {t('Admin')}
                                                </button>
                                            </DropdownMenu.Item>
                                        )}

                                        <DropdownMenu.Separator className="dropdown-separator"/>

                                        <DropdownMenu.Item asChild>
                                            <button className="dropdown-action-item dropdown-action-item--danger"
                                                    onClick={onLogout}>
                                                <i className="font-icon lni lni-power-button"></i>
                                                {t('Logout')}
                                            </button>
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        </div>
                    )}
                </div>
            </nav>

            {settingsTab && (
                <UserSettingsModal
                    isOpen={true}
                    initialTab={settingsTab}
                    onClose={closeSettings}
                />
            )}
            <AdminModal isOpen={adminOpen} onClose={closeAdmin}/>
        </>
    );
};
