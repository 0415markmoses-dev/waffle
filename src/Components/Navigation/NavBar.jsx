import {NavLink} from "react-router-dom";
import {useAuthStore} from "../../store/auth.js";
import {useNavigate} from "react-router";
import {Button} from "../UI/Buttons/Button.jsx";
import {MenuBuilder} from "./MenuBuilder.jsx";
// for the dropdown @see https://www.radix-ui.com/primitives/docs/components/dropdown-menu
import {DropdownMenu} from "radix-ui";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";


export const NavBar = () => {
    const {currentProject, openSelectionModal} = useProjectStore();
    let navigate = useNavigate();
    const {user, clearUserData} = useAuthStore();
    const version_ = import.meta.env.VITE_APP_VERSION;
    const onLogout = (e) => {
        e?.preventDefault();
        clearUserData();
        navigate("/");
    }

    return <nav className="navbar-app flex-grow-0 h-100">
        <div className="w-100 navbar-container d-flex flex-column gap-md">
            <div className="navbar-brand">
                <NavLink className="navbar-brand-link gap-md" to="/" end>
                    <div className="project-picture-wrapper size-sm">
                        <img src="/assets/gator_avatar.png" alt=""/>
                    </div>
                    <span className="label-brand heading">
                        TestGator <i>v{version_}</i>
                    </span>
                </NavLink>
            </div>
            <div className="navbar-project gap-md">
                <Button onClick={() => openSelectionModal()} fullWidth type="dark" size="sm">
                    <div className="btn-text-ellipsis">
                        {currentProject !== null ? currentProject.name : "Select a project"}
                    </div>
                </Button>
                <Button iconOnly type="dark" size="sm">
                    <i className="font-icon lni lni-sliders-horizontal-square-2"></i>
                </Button>
            </div>

            <div className="navbar-menu">
                <MenuBuilder name="navbar"/>
            </div>

            {user !== null && (
                <div className="navbar-profile">
                    <div className="navbar-profile-left">
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger className="profile-avatar">
                                <img src="/assets/fake_user.jpg" alt={user.name}/>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                                <DropdownMenu.Content
                                    side="top" align="start"
                                    sideOffset={10} alignOffset={18}
                                    className="dropdown-content">
                                    <DropdownMenu.Item asChild>
                                        <div
                                            className="dropdown-item d-flex flex-row justify-content-start align-items-center gap-sm">
                                            <div className="profile-avatar me-2 flex-grow-0">
                                                <img src="/assets/fake_user.jpg" alt={user.name}/>
                                            </div>
                                            <div className="flex-grow-1 d-flex flex-column justify-content-start">
                                                <small className="heading opacity-50">Connected as</small>
                                                <div className="heading">{user.email}</div>
                                            </div>
                                        </div>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item asChild>
                                        <div className="dropdown-item">
                                            <Button fullWidth className="text-danger"
                                                    onClick={onLogout}
                                                    type="dark" size="sm">
                                                <span className="text-danger">
                                                    Logout
                                                </span>
                                            </Button>
                                        </div>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>

                    </div>
                    <div className="navbar-profile-right">
                        <Button onClick={onLogout} iconOnly type="dark" size="sm">
                            <i className="font-icon lni lni-power-button text-danger"></i>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    </nav>
}
