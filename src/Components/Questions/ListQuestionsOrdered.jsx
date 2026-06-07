'use client';

import {ModuleRegistry, AllCommunityModule} from 'ag-grid-community';
import {AgGridReact} from "ag-grid-react";
import {useCallback, useMemo, useRef, useState} from "react";
import {ColumnSizing} from "../../Configs/AgGrid/ColumnSizing.js";
import PropTypes from "prop-types";
import {NavLink} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {Button} from "../UI/Buttons/Button.jsx";
import {Alert} from "../UI/Alert/Alert.jsx";
import {useUpdateTestPlan} from "../../Hooks/queries/useTestPlansQuery.js";
import {useQuestions} from "../../Hooks/queries/useQuestionsQuery.js";

ModuleRegistry.registerModules([AllCommunityModule]);

const QuestionLinkRenderer = ({value, data}) => (
    <NavLink to={'/app/project/questions/' + data.id}>{value}</NavLink>
);

const StateCellRenderer = ({value}) => {
    if (!value) return null;
    const cls = {
        archived: 'bg-light text-muted',
        published: 'bg-primary',
        draft: 'bg-dark',
    }[value] ?? 'bg-secondary';
    return <div className={`badge heading ${cls}`}>{value}</div>;
};

const ActionsCellRenderer = ({data}) => {
    const {t} = useTranslation();
    return (
        <div className="d-flex gap-md h-100 p-1 justify-content-end">
            <Button to={'/app/project/questions/' + data.id} type="light" size="sm">
                {t('View')}
            </Button>
        </div>
    );
};

QuestionLinkRenderer.propTypes = StateCellRenderer.propTypes = ActionsCellRenderer.propTypes = {
    value: PropTypes.string,
    data: PropTypes.object.isRequired,
};

/**
 * Sort fetched question objects according to the questionsOrder IRI array.
 * If questionsOrder is empty, return questions in their original API order.
 */
const applyOrder = (questions, questionsOrder) => {
    if (!questionsOrder?.length) return [...questions];
    const indexMap = Object.fromEntries(questionsOrder.map((iri, i) => [iri, i]));
    return [...questions].sort((a, b) => {
        const ia = indexMap[a['@id']] ?? Infinity;
        const ib = indexMap[b['@id']] ?? Infinity;
        return ia - ib;
    });
};

export const ListQuestionsOrdered = ({testPlan}) => {
    const {t} = useTranslation();
    const gridRef = useRef();
    const updateTestPlan = useUpdateTestPlan();
    const [dirty, setDirty] = useState(false);

    // Fetch full question objects for this plan
    const {data: fetchedQuestions = [], isLoading} = useQuestions({
        plan: '/api/test_plans/' + testPlan.id,
        'order[id]': 'asc',
    });

    // Apply questionsOrder sort on top of fetched data
    const rowData = useMemo(
        () => applyOrder(fetchedQuestions, testPlan.questionsOrder),
        [fetchedQuestions, testPlan.questionsOrder]
    );

    // Snapshot original IRI order to detect changes after drag
    const originalOrderRef = useRef([]);
    if (!dirty) {
        originalOrderRef.current = rowData.map(q => q['@id']);
    }

    const colDefs = useMemo(() => [
        {
            rowDrag: true,
            width: 40,
            minWidth: 40,
            maxWidth: 40,
            resizable: false,
            suppressSizeToFit: true,
        },
        {
            field: "id",
            headerName: '#',
            width: 65,
            resizable: false,
            suppressSizeToFit: true,
            valueFormatter: p => '#' + p.value,
        },
        {
            field: "name",
            headerName: t('Name'),
            flex: 1,
            filter: true,
            cellRenderer: QuestionLinkRenderer,
        },
        {
            field: "state",
            headerName: t('State'),
            width: 100,
            cellRenderer: StateCellRenderer,
        },
        {
            headerName: t('Actions'),
            width: 100,
            resizable: false,
            suppressSizeToFit: true,
            cellRenderer: ActionsCellRenderer,
        },
    ], [t]);

    const onGridReady = useCallback(() => {
        gridRef.current?.api.sizeColumnsToFit({defaultMinWidth: 80});
    }, []);

    const handleRowDragEnd = useCallback(() => {
        const currentOrder = [];
        gridRef.current?.api.forEachNode(node => currentOrder.push(node.data['@id']));
        const changed = currentOrder.some((iri, i) => iri !== originalOrderRef.current[i]);
        setDirty(changed);
    }, []);

    const handleSaveOrder = useCallback(() => {
        const newOrder = [];
        gridRef.current?.api.forEachNode(node => newOrder.push(node.data['@id']));
        updateTestPlan.mutate(
            {id: testPlan.id, data: {questionsOrder: newOrder}},
            {onSuccess: () => setDirty(false)}
        );
    }, [testPlan.id, updateTestPlan]);

    const handleCancelOrder = useCallback(() => {
        gridRef.current?.api.setGridOption('rowData', rowData);
        setDirty(false);
    }, [rowData]);

    return (
        <>
            {dirty && (
                <div className="w-100 mb-2 d-flex align-items-center gap-md">
                    <Alert type="info" className="flex-grow-1 m-0">
                        {t('Question order has been changed. Save to apply.')}
                    </Alert>
                    <Button
                        type="light"
                        size="sm"
                        loading={updateTestPlan.isPending}
                        onClick={handleCancelOrder}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        type="primary"
                        size="sm"
                        icon="lni-download-1"
                        loading={updateTestPlan.isPending}
                        onClick={handleSaveOrder}
                    >
                        {t('Save order')}
                    </Button>
                </div>
            )}
            <div className="w-100 position-relative grid-wrapper">
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    getRowId={p => String(p.data.id)}
                    rowDragManaged={true}
                    onRowDragEnd={handleRowDragEnd}
                    loading={isLoading}
                    autoSizeStrategy={ColumnSizing.autoSizeStrategy}
                    pagination={false}
                    onGridReady={onGridReady}
                    domLayout="autoHeight"
                />
            </div>
        </>
    );
};

ListQuestionsOrdered.propTypes = {
    testPlan: PropTypes.object.isRequired,
};
