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
import {useTesters} from "../../Hooks/queries/useTestersQuery.js";

ModuleRegistry.registerModules([AllCommunityModule]);

const LinkCellRenderer = ({value, data}) => (
    <NavLink to={'/app/project/testers/' + data.id}>{value}</NavLink>
);

LinkCellRenderer.propTypes = {
    value: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

export const ListTesters = ({testPlan = undefined}) => {
    const {currentProject} = useProjectStore();
    const gridRef = useRef();

    const params = {
        project: currentProject?.id,
        'order[id]': 'desc',
        ...(testPlan?.id ? {testPlan: '/api/test_plans/' + testPlan.id} : {}),
    };

    const {data: rowData = [], isLoading} = useTesters(params);

    const [colDefs] = useState([
        {field: "email", filter: true, width: 200, cellRenderer: LinkCellRenderer},
        {field: "id", filter: true, width: 200},
        {field: "active", filter: true, width: 30},
        {
            field: "activeProjects",
            filter: false,
            valueFormatter: params => params.value.length,
            width: 160,
            resizable: false,
            suppressSizeToFit: true,
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
