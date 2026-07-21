'use client';

import {ModuleRegistry, AllCommunityModule} from 'ag-grid-community';
import {AgGridReact} from "ag-grid-react";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useCallback, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";
import {ColumnSizing} from "../../Configs/AgGrid/ColumnSizing.js";
import {RowDataUpdate} from "../../Configs/AgGrid/RowDataUpdate.js";
import PropTypes from "prop-types";
import {NavLink} from "react-router-dom";
import {useTesters, useUpdateTester, useDeleteTester} from "../../Hooks/queries/useTestersQuery.js";
import {ConfirmModal} from "../UI/ConfirmModal.jsx";

ModuleRegistry.registerModules([AllCommunityModule]);

const DEFAULT_AVATAR = '/assets/gator_avatar.png';

const initials = (str = '') => {
    const s = typeof str === 'string' ? str : '';
    const parts = s.split(/[\s@._-]+/).filter(Boolean);
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?';
};

const AvatarCellRenderer = ({data}) => {
    const avatarUrl = data?.profilePictureUrl;
    const label = data?.nickname ?? data?.email ?? '';
    const isDefault = !avatarUrl || avatarUrl === DEFAULT_AVATAR;
    return (
        <div className="lt-avatar">
            {!isDefault
                ? <img src={avatarUrl} alt={label} className="lt-avatar-img"/>
                : <span>{initials(label)}</span>
            }
        </div>
    );
};

const ActionsCellRenderer = ({data, api}) => {
    const {t} = useTranslation();
    const deleteTester = useDeleteTester();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleConfirmDelete = () => {
        deleteTester.mutate(data.id, {
            onSuccess: () => {
                toast.success(t('Tester deleted.'));
                setConfirmOpen(false);
                api?.applyTransaction({remove: [data]});
            },
            onError: () => {
                setConfirmOpen(false);
                toast.error(t('Failed to delete tester.'));
            },
        });
    };

    return (
        <div className="lt-actions">
            <NavLink to={'/app/project/testers/' + data.id} className="btn btn-sm btn-light lt-action-btn">
                <i className="font-icon lni lni-eye"/>
            </NavLink>
            <button
                className="btn btn-sm btn-light lt-action-btn lt-action-btn--danger"
                onClick={() => setConfirmOpen(true)}
            >
                <i className="font-icon lni lni-trash-3"/>
            </button>
            <ConfirmModal
                isVisible={confirmOpen}
                title={t('Delete this tester')}
                message={t('Delete tester {{email}}?', {email: data.email ?? `#${data.id}`})}
                confirmLabel={t('Delete')}
                confirmIcon="lni-trash-3"
                loading={deleteTester.isPending}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
};

const ActiveToggleCellRenderer = ({value, data, api}) => {
    const updateTester = useUpdateTester();
    const [active, setActive] = useState(!!value);

    const handleChange = () => {
        const next = !active;
        setActive(next); // optimistic
        updateTester.mutate(
            {id: data.id, data: {active: next}},
            {
                onError: () => setActive(!next), // revert on failure
                onSuccess: (updated) => {
                    // Refresh the row in the grid
                    api.applyTransaction({update: [{...data, active: updated.active}]});
                },
            }
        );
    };

    return (
        <input
            type="checkbox"
            checked={active}
            onChange={handleChange}
            disabled={updateTester.isPending}
            style={{cursor: 'pointer', accentColor: 'var(--color-primary)'}}
        />
    );
};

export const ListTesters = ({testPlan = undefined}) => {
    const {currentProject} = useProjectStore();
    const gridRef = useRef();

    const params = {
        project: currentProject?.id,
        'order[id]': 'desc',
    };

    const {data: allTesters = [], isLoading} = useTesters(params);

    // If a testPlan is provided, restrict to testers enrolled in it
    const enrolledIris = testPlan?.testersEnrolled
        ? testPlan.testersEnrolled.map(t => typeof t === 'string' ? t : t['@id'] ?? `/api/testers/${t.id}`)
        : null;

    const rowData = enrolledIris
        ? allTesters.filter(t => enrolledIris.includes(t['@id'] ?? `/api/testers/${t.id}`))
        : allTesters;

    const [colDefs] = useState([
        {
            headerName: '',
            field: 'profilePictureUrl',
            width: 56,
            sortable: false,
            filter: false,
            resizable: false,
            cellRenderer: AvatarCellRenderer,
        },
        {field: 'email', filter: true, flex: 1, minWidth: 160},
        {field: 'nickname', filter: true, flex: 1, minWidth: 120},
        {field: 'active', headerName: 'Active', filter: true, width: 90, cellRenderer: ActiveToggleCellRenderer},
        {
            headerName: 'Actions',
            field: 'id',
            sortable: false,
            filter: false,
            width: 100,
            resizable: false,
            cellRenderer: ActionsCellRenderer,
        },
    ]);

    const onGridReady = useCallback(() => {
        gridRef.current.api.sizeColumnsToFit({
            defaultMinWidth: 100,
            columnLimits: [{key: "country", minWidth: 900}],
        });
    }, []);

    return (
        <div className="w-100 position-relative grid-wrapper">
            <AgGridReact
                ref={gridRef}
                getRowId={RowDataUpdate.getRowId}
                loading={isLoading}
                autoSizeStrategy={ColumnSizing.autoSizeStrategy}
                paginationPageSize={PaginationSettings.paginationPageSize}
                paginationPageSizeSelector={PaginationSettings.paginationPageSizeSelector}
                pagination={true}
                columnDefs={colDefs}
                onGridReady={onGridReady}
                rowData={rowData}
            />
        </div>
    );
};

ListTesters.propTypes = {
    testPlan: PropTypes.object,
};
