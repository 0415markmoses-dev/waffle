'use client';

import {ModuleRegistry, AllCommunityModule} from 'ag-grid-community';
import {AgGridReact} from "ag-grid-react";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useCallback, useRef, useState} from "react";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";
import {ColumnSizing} from "../../Configs/AgGrid/ColumnSizing.js";
import {RowDataUpdate} from "../../Configs/AgGrid/RowDataUpdate.js";
import PropTypes from "prop-types";
import {NavLink} from "react-router-dom";
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Button} from "../UI/Buttons/Button.jsx";
import {useTestPlans} from "../../Hooks/queries/useTestPlansQuery.js";

ModuleRegistry.registerModules([AllCommunityModule]);

const LinkCellRenderer = ({value, data}) => (
    <NavLink to={'/app/project/testing_plans/' + data.id}>{value}</NavLink>
);

const StateCellRenderer = ({value}) => {
    const stateBadge = classNames('badge heading', {
        "bg-light text-muted": value === 'archived',
        "bg-primary": value === 'published',
        "bg-dark": value === 'draft',
    });
    return <div className={stateBadge}>{value}</div>;
};

const ActionsCellRenderer = ({data}) => {
    const {t} = useTranslation();
    return (
        <div className="d-flex gap-md h-100 p-1 justify-content-end">
            <Button iconOnly type="light" size="sm">
                <i className="font-icon lni lni-share-2"></i>
            </Button>
            <Button to={'/app/project/testing_plans/' + data.id} type="light" size="sm">
                {t('View')}
            </Button>
        </div>
    );
};

ActionsCellRenderer.propTypes = StateCellRenderer.propTypes = LinkCellRenderer.propTypes = {
    value: PropTypes.string,
    data: PropTypes.object.isRequired,
};

export const ListTestPlans = ({release = undefined}) => {
    const {t} = useTranslation();
    const {currentProject} = useProjectStore();
    const gridRef = useRef();

    const params = {
        'order[id]': 'desc',
        ...(release?.id ? {release: '/api/releases/' + release.id} : {project: currentProject?.id}),
    };

    const {data: rowData = [], isLoading} = useTestPlans(params);

    const [colDefs] = useState([
        {
            field: "id",
            width: 65,
            resizable: false,
            suppressSizeToFit: true,
            valueFormatter: params => '#' + params.value,
        },
        {field: "name", filter: true, width: 150, cellRenderer: LinkCellRenderer},
        {field: "state", filter: true, width: 90, cellRenderer: StateCellRenderer},
        {
            field: "dueDate",
            filter: true,
            width: 90,
            valueFormatter: params => new Date(params.value).toLocaleDateString(),
        },
        {
            field: "totalTestersEnrolled",
            headerName: t("totalTestersEnrolled"),
            filter: false,
            width: 100,
            resizable: false,
            suppressSizeToFit: true,
        },
        {
            field: "totalQuestions",
            headerName: t("totalQuestions"),
            filter: false,
            width: 100,
            resizable: false,
            suppressSizeToFit: true,
        },
        {
            field: "id",
            headerName: t("Actions"),
            width: 200,
            resizable: false,
            suppressSizeToFit: true,
            cellRenderer: ActionsCellRenderer,
        },
    ]);

    const onGridReady = useCallback(() => {
        gridRef.current.api.sizeColumnsToFit({defaultMinWidth: 100});
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

ListTestPlans.propTypes = {
    release: PropTypes.object,
};
