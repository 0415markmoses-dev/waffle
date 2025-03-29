'use client';

import {
    ModuleRegistry,
    AllCommunityModule,
} from 'ag-grid-community';

import {AgGridReact} from "ag-grid-react";
import {useProjectStore} from "../../Store/PrivateData/ProjectsStore.js";
import {useCallback, useEffect, useRef, useState} from "react";
import {PaginationSettings} from "../../Configs/PaginationSettings.js";
import {ColumnSizing} from "../../Configs/AgGrid/ColumnSizing.js";
import {RowDataUpdate} from "../../Configs/AgGrid/RowDataUpdate.js";
import PropTypes from "prop-types";
import {NavLink} from "react-router-dom";
import TestersService from "../../Services/PrivateApi/TestersService.js";
import {ModalCreateNewTester} from "./ModalCreateNewTester.jsx";

ModuleRegistry.registerModules([
    AllCommunityModule,
]);

const LinkCellRenderer = ({value, data}) => {
    return <NavLink to={'/app/project/testers/' + data.id}>{value}</NavLink>
}

LinkCellRenderer.propTypes = {
    value: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
}

export const ListTesters = () => {
    const {currentProject} = useProjectStore();
    const gridRef = useRef();
    const [loading, setLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [colDefs] = useState([
        {
            field: "email",
            filter: true,
            width: 200,
            cellRenderer: LinkCellRenderer,
        },
        {
            field: "id",
            filter: true,
            width: 200,
        },
        {
            field: "active",
            filter: true,
            width: 30,
        },
        {
            field: "activeProjects",
            filter: false,
            valueFormatter: params => {
                return params.value.length;
            },
            width: 160,
            resizable: false,
            suppressSizeToFit: true
        },
    ]);


    const handleLoading = useCallback((page, previousData = [], callback = () => {
    }) => {
        TestersService.getTesters({
            project: currentProject.id,
            'order[id]': 'desc',
            page: page,
            itemsPerPage: PaginationSettings.ApiItemsPerPage,
        })
            .then(response => {
                if (response.data['member'] !== undefined) {
                    const totalData = [...previousData, ...response.data['member']];
                    if (totalData.length < response.data['totalItems']) {
                        handleLoading(page + 1, totalData, callback);
                    } else {
                        setRowData(totalData);
                        callback();
                    }
                } else {
                    setRowData([]);
                    callback();
                }
            })
            .catch(err => {
                console.error(err);
                callback();
            })
    }, [currentProject?.id]);


    useEffect(() => {
        setLoading(true);
        handleLoading(1, [], () => setLoading(false));
    }, [currentProject?.id]);

    const onGridReady = () => {
        gridRef.current.api.sizeColumnsToFit({
            defaultMinWidth: 100,
            columnLimits: [{key: "country", minWidth: 900}],
        });
    }

    return <>
        <div className="w-100 position-relative grid-wrapper">
            <AgGridReact
                ref={gridRef}
                getRowId={RowDataUpdate.getRowId}
                loading={loading}
                autoSizeStrategy={ColumnSizing.autoSizeStrategy}
                paginationPageSize={PaginationSettings.paginationPageSize}
                paginationPageSizeSelector={PaginationSettings.paginationPageSizeSelector}
                pagination={true}
                columnDefs={colDefs}
                onGridReady={onGridReady}
                rowData={rowData}/>
        </div>

    </>
}
