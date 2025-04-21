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
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Button} from "../UI/Buttons/Button.jsx";
import QuestionsService from "../../Services/PrivateApi/QuestionsService.js";

ModuleRegistry.registerModules([
    AllCommunityModule,
]);

const LinkCellRenderer = ({value, data}) => {
    return <NavLink to={'/app/project/testing_plans/' + data.id}>{value}</NavLink>
}

const StateCellRenderer = ({value, data}) => {
    const stateBadge = classNames(
        'badge heading',
        {
            "bg-light text-muted": value === 'archived',
            "bg-primary": value === 'published',
            "bg-dark": value === 'draft',
        }
    );

    return <div className={stateBadge}>{value}</div>
}

const ActionsCellRenderer = ({value, data}) => {
    const {t} = useTranslation();

    return <div className="d-flex gap-md h-100 p-1 justify-content-end">
        <Button iconOnly type="light" size="sm">
            <i className="font-icon lni lni-share-2"></i>
        </Button>
        <Button to={'/app/project/testing_plans/' + data.id} type="light" size="sm">
            {t('View')}
        </Button>
    </div>
}

ActionsCellRenderer.propTypes = StateCellRenderer.propTypes = LinkCellRenderer.propTypes = {
    value: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
}

export const ListQuestions = ({
                                  testingPlan = undefined,
                              }) => {
    const {t} = useTranslation();
    const {currentProject} = useProjectStore();
    const gridRef = useRef();
    const [loading, setLoading] = useState(false);
    const [rowData, setRowData] = useState([]);
    const [colDefs] = useState([
        {
            field: "id",
            width: 65,
            resizable: false,
            suppressSizeToFit: true,
            valueFormatter: params => {
                return '#' + params.value;
            },
        },
        {
            field: "name",
            filter: true,
            width: 150,
            cellRenderer: LinkCellRenderer,
        },
        {
            field: "state",
            filter: true,
            width: 90,
            cellRenderer: StateCellRenderer,
        },
        {
            field: "dueDate",
            filter: true,
            width: 90,
            valueFormatter: params => {
                // return date locale string
                return new Date(params.value).toLocaleDateString();
            },
        },
        {
            field: "totalTestersEnrolled",
            headerName: t("totalTestersEnrolled"),
            filter: false,
            width: 200,
            resizable: false,
            suppressSizeToFit: true
        },
        {
            field: "totalQuestions",
            headerName: t("totalQuestions"),
            filter: false,
            width: 200,
            resizable: false,
            suppressSizeToFit: true
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


    const handleLoading = useCallback((page, previousData = [], callback = () => {
    }) => {
        let payload = {
            'order[id]': 'desc',
            page: page,
            itemsPerPage: PaginationSettings.ApiItemsPerPage,
        };

        if (testingPlan?.id !== undefined) {
            //payload.questions = '/api/testing_plans/' + testingPlan.id;
        }


        QuestionsService.getQuestions(payload)
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
    }, [testingPlan?.id]);


    useEffect(() => {
        setLoading(true);
        handleLoading(1, [], () => setLoading(false));
    }, [currentProject?.id]);

    const onGridReady = () => {
        gridRef.current.api.sizeColumnsToFit({
            defaultMinWidth: 100,
        });
    }

    console.log('rowData', rowData);

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
