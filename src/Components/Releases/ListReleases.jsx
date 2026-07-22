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
import {useReleases} from "../../Hooks/queries/useReleasesQuery.js";

ModuleRegistry.registerModules([AllCommunityModule]);

const LinkCellRenderer = ({value, data}) => (
    <NavLink to={'/app/project/releases/' + data.id}>{value}</NavLink>
);

LinkCellRenderer.propTypes = {
    value: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};

export const ListReleases = () => {
    const {currentProjectId} = useProjectStore();
    const gridRef = useRef();

    const {data: rowData = [], isLoading} = useReleases({
        project: currentProjectId,
        'order[id]': 'desc',
    });

    const [colDefs] = useState([
        {
            field: "id",
            width: 65,
            resizable: false,
            suppressSizeToFit: true,
            valueFormatter: params => '#' + params.value,
        },
        {field: "name", filter: true, width: 110, cellRenderer: LinkCellRenderer},
        {field: "project.name", filter: true, width: 110},
        {
            field: "plans",
            filter: false,
            valueFormatter: params => params.value.length,
            width: 90,
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
