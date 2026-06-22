import {useState, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import toast from 'react-hot-toast';
import {useUsers, useUpdateUser, useDeleteUser} from '../../Hooks/queries/useUsersQuery.js';
import {useDebounce} from '../../Hooks/useDebounce.js';
import {Button} from '../UI/Buttons/Button.jsx';
import {ModalCreateUser} from './ModalCreateUser.jsx';
import {ModalChangePassword} from './ModalChangePassword.jsx';

const ROLES = ['ROLE_MANAGER', 'ROLE_ADMIN'];
const ITEMS_PER_PAGE = 5;

// ── RolesSelector ─────────────────────────────────────────────────────────────

const RolesSelector = ({roles = [], onChange, disabled}) => {
    const toggle = (role) => {
        const next = roles.includes(role)
            ? roles.filter(r => r !== role)
            : [...roles, role];
        // Always keep ROLE_USER
        if (!next.includes('ROLE_USER')) next.unshift('ROLE_USER');
        onChange(next);
    };

    return (
        <div className="users-roles-selector">
            <span className="users-role-badge users-role-badge--fixed">ROLE_USER</span>
            {ROLES.map(role => (
                <label key={role} className="users-role-check">
                    <input
                        type="checkbox"
                        checked={roles.includes(role)}
                        onChange={() => toggle(role)}
                        disabled={disabled}
                    />
                    <span className={`users-role-badge${roles.includes(role) ? ' users-role-badge--active' : ''}`}>
                        {role.replace('ROLE_', '')}
                    </span>
                </label>
            ))}
        </div>
    );
};

// ── UserRow ───────────────────────────────────────────────────────────────────

const UserRow = ({user, onPasswordClick}) => {
    const {t} = useTranslation();
    const updateUser = useUpdateUser();
    const deleteUser = useDeleteUser();

    const [email, setEmail] = useState(user.email);
    const [active, setActive] = useState(!!user.active);
    const [roles, setRoles] = useState(user.roles ?? ['ROLE_USER']);
    const [dirty, setDirty] = useState(false);

    const handleChange = useCallback((setter) => (val) => {
        setter(val);
        setDirty(true);
    }, []);

    const handleUpdate = () => {
        updateUser.mutate(
            {id: user.id, data: {email, active, roles}},
            {
                onSuccess: () => {
                    toast.success(t('User updated.'));
                    setDirty(false);
                },
                onError: () => toast.error(t('Failed to update user.')),
            }
        );
    };

    const handleDelete = () => {
        if (!window.confirm(t('Delete user {{email}}?', {email: user.email}))) return;
        deleteUser.mutate(user.id, {
            onSuccess: () => toast.success(t('User deleted.')),
            onError: () => toast.error(t('Failed to delete user.')),
        });
    };

    const isPending = updateUser.isPending || deleteUser.isPending;

    return (
        <tr className={dirty ? 'users-row--dirty' : ''}>
            <td>
                <input
                    type="email"
                    className="form-control form-control-sm users-email-input"
                    value={email}
                    onChange={e => handleChange(setEmail)(e.target.value)}
                    disabled={isPending}
                />
            </td>
            <td className="text-center">
                <div className="form-check form-switch mb-0 d-flex justify-content-center">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={active}
                        onChange={e => handleChange(setActive)(e.target.checked)}
                        disabled={isPending}
                    />
                </div>
            </td>
            <td>
                <RolesSelector
                    roles={roles}
                    onChange={handleChange(setRoles)}
                    disabled={isPending}
                />
            </td>
            <td>
                <span className="users-type-badge">{user.type ?? '—'}</span>
            </td>
            <td>
                <div className="users-actions">
                    <Button size="sm" type="light" iconOnly title={t('Password')} onClick={() => onPasswordClick(user)}
                            disabled={isPending}>
                        <i className="font-icon lni lni-key-1"/>
                    </Button>
                    <Button
                        size="sm"
                        type="primary"
                        iconOnly
                        title={t('Update')}
                        onClick={handleUpdate}
                        disabled={!dirty || isPending}
                        loading={updateUser.isPending}
                    >
                        <i className="font-icon lni lni-floppy-disk-1"/>
                    </Button>
                    <Button
                        size="sm"
                        type="danger"
                        iconOnly
                        title={t('Delete')}
                        onClick={handleDelete}
                        disabled={isPending}
                        loading={deleteUser.isPending}
                    >
                        <i className="font-icon lni lni-trash-3"/>
                    </Button>
                </div>
            </td>
        </tr>
    );
};

// ── UsersTab ──────────────────────────────────────────────────────────────────

export const UsersTab = ({onAddUser}) => {
    const {t} = useTranslation();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pwdUser, setPwdUser] = useState(null);

    const debouncedSearch = useDebounce(search, 300);

    const params = {
        itemsPerPage: ITEMS_PER_PAGE,
        page,
        ...(debouncedSearch ? {email: debouncedSearch} : {}),
    };

    const {data, isLoading} = useUsers(params);
    const members = data?.['member'] ?? [];
    const total = data?.totalItems ?? 0;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div className="users-tab">
            {/* Toolbar */}
            <div className="users-toolbar">
                <div className="users-search-wrapper">
                    <i className="font-icon lni lni-search-alt-1 users-search-icon"/>
                    <input
                        type="text"
                        className="form-control form-control-sm users-search"
                        placeholder={t('Search users…')}
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
                <Button type="primary" size="sm" icon="lni-user-add-1" onClick={onAddUser}>
                    {t('Add new user')}
                </Button>
            </div>

            {/* Table */}
            <div className="users-table-wrapper">
                {isLoading ? (
                    <div className="users-loading">{t('Loading…')}</div>
                ) : members.length === 0 ? (
                    <div className="users-empty">{t('No users found.')}</div>
                ) : (
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>{t('Email')}</th>
                            <th className="text-center">{t('Active')}</th>
                            <th>{t('Roles')}</th>
                            <th>{t('Type')}</th>
                            <th>{t('Actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {members.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                onPasswordClick={setPwdUser}
                            />
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="users-pagination">
                    <Button
                        size="sm"
                        type="light"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        icon="lni-chevron-left"
                    />
                    <span className="users-page-info">
                        {t('Page {{page}} of {{total}}', {page, total: totalPages})}
                    </span>
                    <Button
                        size="sm"
                        type="light"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        icon="lni-chevron-right"
                    />
                </div>
            )}

            {/* Password modal */}
            {pwdUser && (
                <ModalChangePassword user={pwdUser} onClose={() => setPwdUser(null)}/>
            )}
        </div>
    );
};
