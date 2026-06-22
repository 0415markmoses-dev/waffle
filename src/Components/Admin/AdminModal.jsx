import Modal from 'react-modal';
import {useEffect, useMemo, useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {TabWrapper} from '../UI/Tabs/TabWrapper.jsx';
import {Tab} from '../UI/Tabs/Tab.jsx';
import {Button} from '../UI/Buttons/Button.jsx';
import {ModalHeader} from '../UI/ReactModal/ModalHeader.jsx';
import {ModalBody} from '../UI/ReactModal/ModalBody.jsx';
import {ModalFooter} from '../UI/ReactModal/ModalFooter.jsx';
import {AppSetting} from '../UI/Settings/AppSetting.jsx';
import SettingsService from '../../Services/PrivateApi/SettingsService.js';
import {UsersTab} from './UsersTab.jsx';
import {ModalCreateUser} from './ModalCreateUser.jsx';

Modal.setAppElement('#root');

const modalStyles = {
    overlay: {zIndex: 1050, background: 'rgba(0,0,0,.45)'},
    content: {
        top: '50%', left: '50%', right: 'auto', bottom: 'auto',
        marginRight: '-50%', transform: 'translate(-50%, -50%)',
        padding: 0, border: 'none', borderRadius: '12px',
        width: '100%', minWidth: '780px', maxWidth: '1024px',
        minHeight: '65vh', maxHeight: '85vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
    },
};

const PAD = '1.25rem';

// ── Settings definitions ──────────────────────────────────────────────────────

const SETTINGS_DEFS = [
    // General
    {
        section: 'general', name: 'allow_upload', type: 'boolean',
        label: 'Allow uploads',
        description: 'Allow testers to attach files to their answers.',
    },
    // Webhooks
    {
        section: 'webhook', name: 'enable_webhook', type: 'boolean',
        label: 'Enable webhook',
        description: 'Send a POST request to the webhook URL on key events.',
    },
    {
        section: 'webhook', name: 'webhook_url', type: 'string',
        label: 'Webhook URL',
        description: 'The endpoint that will receive webhook payloads.',
    },
    // Notifications
    {
        section: 'notifications', name: 'enable_tester_notifications', type: 'boolean',
        label: 'Enable tester notifications',
        description: 'Send email notifications to testers when a plan is assigned or updated.',
    },
    {
        section: 'notifications', name: 'enable_dev_team_members_notifications', type: 'boolean',
        label: 'Enable dev team notifications',
        description: 'Notify team members when answers are submitted or plans are completed.',
    },
];

const settingId = ({section, name}) => `${section}.${name}`;
const defaultFor = (type) => type === 'boolean' ? 'false' : '';

// ── AdminModal ────────────────────────────────────────────────────────────────

export const AdminModal = ({isOpen, onClose}) => {
    const queryClient = useQueryClient();
    const [dirty, setDirty] = useState({});
    const [saving, setSaving] = useState(false);
    const [createUserOpen, setCreateUserOpen] = useState(false);

    // Load all settings (100 per page is plenty for admin settings)
    const {data: settingsRaw, isLoading} = useQuery({
        queryKey: ['admin-settings'],
        queryFn: () => SettingsService.getSettings({itemsPerPage: 100}).then(r => r.data),
        enabled: isOpen,
    });

    // Index loaded settings by their computed id
    const loaded = useMemo(() => {
        const members = settingsRaw?.['member'] ?? settingsRaw?.['hydra:member'] ?? [];
        return Object.fromEntries(members.map(s => [s.id, s]));
    }, [settingsRaw]);

    // Reset pending changes every time the modal opens
    useEffect(() => {
        if (isOpen) setDirty({});
    }, [isOpen]);

    // Resolve the display value for a setting: dirty > loaded > default
    const getValue = (def) => {
        const id = settingId(def);
        if (dirty[id] !== undefined) return dirty[id];
        const stored = loaded[id]?.value;
        return stored ?? defaultFor(def.type);
    };

    const handleChange = (def, value) => {
        setDirty(prev => ({...prev, [settingId(def)]: value}));
    };

    // ── Save ──────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        const entries = Object.entries(dirty);
        if (entries.length === 0) {
            toast('No changes to save.');
            return;
        }

        setSaving(true);

        const results = await Promise.allSettled(
            entries.map(([id, value]) => {
                if (loaded[id]) {
                    return SettingsService.updateSetting(id, {value});
                }
                const def = SETTINGS_DEFS.find(d => settingId(d) === id);
                return SettingsService.createSetting({
                    section: def.section,
                    name: def.name,
                    value,
                    autoload: false,
                    public: false,
                });
            })
        );

        results.forEach((result, i) => {
            const [id] = entries[i];
            const def = SETTINGS_DEFS.find(d => settingId(d) === id);
            const label = def?.label ?? id;
            if (result.status === 'fulfilled') {
                toast.success(`"${label}" saved.`);
            } else {
                toast.error(`Failed to save "${label}".`);
            }
        });

        setSaving(false);
        setDirty({});
        queryClient.invalidateQueries({queryKey: ['admin-settings']});
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const defs = (tab) => SETTINGS_DEFS.filter(d => {
        if (tab === 'general') return d.section === 'general';
        if (tab === 'webhooks') return d.section === 'webhook';
        if (tab === 'notifications') return d.section === 'notifications';
        return false;
    });

    const renderSettings = (tab) => (
        <div className="d-flex flex-column">
            {isLoading ? (
                <div className="admin-upcoming">
                    <span className="admin-upcoming-title">Loading…</span>
                </div>
            ) : defs(tab).map(def => (
                <AppSetting
                    key={settingId(def)}
                    section={def.section}
                    name={def.name}
                    type={def.type}
                    label={def.label}
                    description={def.description}
                    value={getValue(def)}
                    onChange={value => handleChange(def, value)}
                />
            ))}
        </div>
    );

    return (
        <>
        <Modal style={modalStyles} isOpen={isOpen} onRequestClose={onClose}>
            <div style={{padding: PAD, paddingBottom: 0}}>
                <ModalHeader title="Admin settings"/>
            </div>

            <ModalBody>
                <div style={{padding: PAD, paddingBottom: 0}}>
                    <TabWrapper name="admin-settings">
                        <Tab icon="lni-gear-1" name="general" title="General" active>
                            {renderSettings('general')}
                        </Tab>
                        <Tab icon="lni-webhooks" name="webhooks" title="Webhooks">
                            {renderSettings('webhooks')}
                        </Tab>
                        <Tab icon="lni-bell-1" name="notifications" title="Notifications">
                            {renderSettings('notifications')}
                        </Tab>
                        <Tab icon="lni-user-multiple-4" name="users" title="Users">
                            <UsersTab onAddUser={() => {
                                onClose();
                                setCreateUserOpen(true);
                            }}/>
                        </Tab>
                    </TabWrapper>
                </div>
            </ModalBody>

            <div style={{padding: PAD, paddingTop: 0}}>
                <ModalFooter>
                    <Button type="default" onClick={onClose}>Cancel</Button>
                    <Button
                        type="primary"
                        icon="lni-check-circle-1"
                        onClick={handleSave}
                        disabled={saving || Object.keys(dirty).length === 0}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </ModalFooter>
            </div>
        </Modal>

            <ModalCreateUser
                isOpen={createUserOpen}
                onClose={() => setCreateUserOpen(false)}
            />
        </>
    );
};
