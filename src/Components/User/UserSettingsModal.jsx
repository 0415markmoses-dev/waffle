import Modal from 'react-modal';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {useAuthStore, isTester} from '../../Store/auth.js';
import {TabWrapper} from '../UI/Tabs/TabWrapper.jsx';
import {Tab} from '../UI/Tabs/Tab.jsx';
import {Button} from '../UI/Buttons/Button.jsx';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {ModalFooter} from '../UI/ReactModal/ModalFooter.jsx';

Modal.setAppElement('#root');

const modalStyles = {
    overlay: {zIndex: 1050, background: 'rgba(0,0,0,.45)'},
    content: {
        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
        marginRight: '-50%', transform: 'translate(-50%, -50%)',
        padding: 0, border: 'none', borderRadius: '12px',
        width: '100%', maxWidth: '540px',
        maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
    },
};

const USM_PADDING = '1.25rem';

// ── Profile tab ───────────────────────────────────────────────────────────────

const ProfileTab = ({user}) => {
    const {t} = useTranslation();
    return (
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
                <label className="form-label text-muted small mb-1">{t('Email')}</label>
                <input
                    type="email"
                    className="form-control"
                    value={user?.email ?? '—'}
                    readOnly
                    disabled
                />
            </div>
        </div>
    );
};

// ── Security tab — dev ────────────────────────────────────────────────────────

const SecurityDevTab = () => {
    const {t} = useTranslation();
    return (
        <div className="d-flex flex-column gap-md">
            <div className="form-group">
                <label className="form-label text-muted small mb-1">{t('New password')}</label>
                <input type="password" className="form-control" placeholder="••••••••"/>
            </div>
            <div className="form-group">
                <label className="form-label text-muted small mb-1">{t('Confirm new password')}</label>
                <input type="password" className="form-control" placeholder="••••••••"/>
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
    const {t, i18n} = useTranslation();
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

    const showFooter = (activeTab === 'security' && !tester) || activeTab === 'interface';

    const handleSaveInterface = () => {
        i18n.changeLanguage(pendingLang);
        toast.success(t('Interface settings saved.'));
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
                            <ProfileTab user={user}/>
                        </Tab>
                        <Tab icon="lni-locked-1" name="security" title={t('Security')}
                             active={initialTab === 'security'}>
                            {tester ? <SecurityTesterTab/> : <SecurityDevTab/>}
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
                        {activeTab === 'security' && (
                            <Button type="primary" icon="lni-locked-1">{t('Update password')}</Button>
                        )}
                        {activeTab === 'interface' && (
                            <Button type="primary" icon="lni-check-circle-1"
                                    onClick={handleSaveInterface}>{t('Save')}</Button>
                        )}
                    </ModalFooter>
                </div>
            )}
        </Modal>
    );
};
