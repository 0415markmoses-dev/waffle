import Modal from 'react-modal';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {useAuthStore, isTester} from '../../Store/auth.js';
import {TabWrapper} from '../UI/Tabs/TabWrapper.jsx';
import {Tab} from '../UI/Tabs/Tab.jsx';
import {Button} from '../UI/Buttons/Button.jsx';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {ModalFooter} from '../UI/ReactModal/ModalFooter.jsx';
import {useAuthMode} from '../../Hooks/queries/useAuthModeQuery.js';
import {PasswordInput, GeneratorPanel} from '../UI/Form/PasswordFields.jsx';
import AuthService from '../../Services/Authentication/AuthService.js';
import UsersService from '../../Services/PrivateApi/UsersService.js';
import TestersService from '../../Services/PrivateApi/TestersService.js';
import {DevTeamAvatarEditor} from './DevTeamAvatarEditor.jsx';

Modal.setAppElement('#root');

const modalStyles = {
    overlay: {zIndex: 1050, background: 'rgba(0,0,0,.45)'},
    content: {
        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
        marginRight: '-50%', transform: 'translate(-50%, -50%)',
        padding: 0, border: 'none', borderRadius: '12px',
        width: '100%', maxWidth: '720px',
        maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
    },
};

const USM_PADDING = '1.25rem';

// ── Profile tab ───────────────────────────────────────────────────────────────

const ProfileTab = ({user, tester}) => {
    const {t} = useTranslation();
    const {getUserData} = useAuthStore();
    const [nickname, setNickname] = useState(user?.nickname ?? '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setNickname(user?.nickname ?? '');
    }, [user?.nickname]);

    const isDirty = nickname !== (user?.nickname ?? '');

    const handleSaveNickname = async () => {
        if (!isDirty || saving) return;
        setSaving(true);
        try {
            if (tester) {
                await TestersService.updateNickname(user.id, nickname);
            } else {
                await UsersService.updateUser(user.id, {nickname});
            }
            await getUserData();
            toast.success(t('Nickname updated.'));
        } catch {
            toast.error(t('Failed to update nickname.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={tester ? undefined : 'row g-4 align-items-start'}>
            {/* Left col — avatar editor (dev team only) */}
            {!tester && (
                <div className="col-4">
                    <DevTeamAvatarEditor
                        profilePictureUrl={user?.profilePictureUrl}
                    />
                </div>
            )}

            {/* Right col — info + editable nickname */}
            <div className={tester ? undefined : 'col-7'}>
                <div className="d-flex flex-column gap-md">
                    <div className="form-group">
                        <label className="form-label text-muted small mb-1">{t('UUID')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user?.uuid ?? user?.id ?? '—'}
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label text-muted small mb-1">{t('Nickname')}</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nickname}
                            maxLength={128}
                            onChange={e => setNickname(e.target.value)}
                            disabled={saving}
                            placeholder={t('Your nickname')}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label text-muted small mb-1">{t('Email')}</label>
                        <input
                            type="email"
                            className="form-control"
                            value={user?.email ?? '—'}
                            readOnly
                            disabled
                        />
                    </div>
                    <Button
                        type="primary"
                        icon="lni-check"
                        onClick={handleSaveNickname}
                        disabled={!isDirty}
                        loading={saving}
                    >
                        {t('Save')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ── Security tab — dev (db mode) ──────────────────────────────────────────────

const SecurityDevDbTab = () => {
    const {t} = useTranslation();
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [genOpen, setGenOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const mismatch = newPwd && confirmPwd && newPwd !== confirmPwd;
    const canSave = newPwd && confirmPwd && newPwd === confirmPwd && !saving;

    const handleNewPwd = (v) => {
        setNewPwd(v);
        if (v) setGenOpen(false);
    };

    const handleUseGenerated = (pwd) => {
        setNewPwd(pwd);
        setConfirmPwd(pwd);
        setGenOpen(false);
    };

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        try {
            await AuthService.changePasswordSelf(newPwd);
            toast.success(t('Password updated.'));
            setNewPwd('');
            setConfirmPwd('');
        } catch {
            toast.error(t('Failed to update password.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="d-flex flex-column gap-md">
            <div className="pwd-field-group">
                <label className="pwd-field-label" htmlFor="self-pwd-new">
                    {t('New password')}
                </label>
                <PasswordInput
                    id="self-pwd-new"
                    value={newPwd}
                    onChange={handleNewPwd}
                    placeholder="••••••••"
                    disabled={saving}
                />
                {!newPwd && (
                    <button
                        type="button"
                        className="pwd-gen-toggle-btn"
                        onClick={() => setGenOpen(o => !o)}
                    >
                        <i className="font-icon lni lni-shuffle"/>
                        {t('Generate password')}
                        <i className={`font-icon lni ${genOpen ? 'lni-chevron-up' : 'lni-chevron-down'}`}/>
                    </button>
                )}
                {genOpen && !newPwd && (
                    <GeneratorPanel onUse={handleUseGenerated}/>
                )}
            </div>

            <div className="pwd-field-group">
                <label className="pwd-field-label" htmlFor="self-pwd-confirm">
                    {t('Confirm password')}
                </label>
                <PasswordInput
                    id="self-pwd-confirm"
                    value={confirmPwd}
                    onChange={setConfirmPwd}
                    placeholder="••••••••"
                    disabled={saving}
                />
                {mismatch && (
                    <span className="pwd-mismatch-msg">{t('Passwords do not match.')}</span>
                )}
            </div>

            <Button
                type="primary"
                icon="lni-locked-1"
                onClick={handleSave}
                disabled={!canSave}
                loading={saving}
            >
                {t('Update password')}
            </Button>
        </div>
    );
};

// ── Security tab — dev (ldap mode) ────────────────────────────────────────────

const SecurityDevLdapTab = () => {
    const {t} = useTranslation();
    return (
        <div className="usm-otp-info">
            <i className="font-icon lni lni-locked-1 usm-otp-icon"/>
            <div>
                <div className="usm-otp-title">{t('Password managed by your organization')}</div>
                <p className="usm-otp-desc">
                    {t('Your password is managed by your organization\'s directory service (LDAP). Contact your administrator to change it.')}
                </p>
            </div>
        </div>
    );
};

// ── Security tab — tester ─────────────────────────────────────────────────────

const SecurityTesterTab = () => {
    const {t} = useTranslation();
    return (
        <div className="d-flex flex-column gap-lg">
            <div className="usm-otp-info">
                <i className="font-icon lni lni-locked-1 usm-otp-icon"/>
                <div>
                    <div className="usm-otp-title">{t('No password needed')}</div>
                    <p className="usm-otp-desc">
                        {t('Your account is secured with one-time codes sent to your email. Each time you log in, a unique code is delivered to your inbox — no password to remember, no password to steal.')}
                    </p>
                    <p className="usm-otp-desc">
                        {t('If you believe someone else has access to your account, contact your project administrator immediately.')}
                    </p>
                </div>
            </div>
            <Button type="danger" icon="lni-shield-2">
                {t('Help — I think my account is compromised')}
            </Button>
        </div>
    );
};

// ── Interface tab ─────────────────────────────────────────────────────────────

const LANGUAGES = [
    {code: 'en', label: 'English'},
    {code: 'fr', label: 'Français'},
    {code: 'es', label: 'Español'},
    {code: 'de', label: 'Deutsch'},
    {code: 'it', label: 'Italiano'},
];

const InterfaceTab = ({pendingLang, onLangChange}) => {
    const {t} = useTranslation();
    return (
        <div className="d-flex flex-column gap-md">
            <div className="form-group">
                <label className="form-label text-muted small mb-1">{t('Language')}</label>
                <select
                    className="form-select"
                    value={pendingLang}
                    onChange={e => onLangChange(e.target.value)}
                >
                    {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

// ── UserSettingsModal ─────────────────────────────────────────────────────────

export const UserSettingsModal = ({isOpen, initialTab = 'profile', onClose}) => {
    const {t, i18n} = useTranslation();
    const {user} = useAuthStore();
    const tester = isTester(user);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [pendingLang, setPendingLang] = useState(i18n.language?.slice(0, 2) ?? 'en');

    const {data: authMode} = useAuthMode();
    const isDbMode = authMode?.mode === 'db';

    const showFooter = activeTab === 'interface';

    const handleSaveInterface = () => {
        i18n.changeLanguage(pendingLang);
        toast.success(t('Interface settings saved.'));
    };

    const renderSecurityTab = () => {
        if (tester) return <SecurityTesterTab/>;
        if (isDbMode) return <SecurityDevDbTab/>;
        return <SecurityDevLdapTab/>;
    };

    return (
        <Modal style={modalStyles} isOpen={isOpen} onRequestClose={onClose}>
            <div style={{padding: USM_PADDING, paddingBottom: 0}}>
                <ModalHeader title={t('Account settings')} subtitle={user?.email ?? ''}/>
            </div>
            <ModalBody>
                <div style={{padding: USM_PADDING, paddingBottom: showFooter ? 0 : USM_PADDING}}>
                    <TabWrapper key={initialTab} name="user-settings" onChange={tab => tab && setActiveTab(tab.name)}>
                        <Tab icon="lni-user-4" name="profile" title={t('Profile')} active={initialTab === 'profile'}>
                            <ProfileTab user={user} tester={tester}/>
                        </Tab>
                        <Tab icon="lni-locked-1" name="security" title={t('Security')}
                             active={initialTab === 'security'}>
                            {renderSecurityTab()}
                        </Tab>
                        <Tab icon="lni-sliders-horizontal-square-2" name="interface" title={t('Interface')}
                             active={initialTab === 'interface'}>
                            <InterfaceTab pendingLang={pendingLang} onLangChange={setPendingLang}/>
                        </Tab>
                    </TabWrapper>
                </div>
            </ModalBody>
            {showFooter && (
                <div style={{padding: USM_PADDING, paddingTop: 0}}>
                    <ModalFooter>
                        <Button type="primary" icon="lni-check-circle-1"
                                onClick={handleSaveInterface}>{t('Save')}</Button>
                    </ModalFooter>
                </div>
            )}
        </Modal>
    );
};
