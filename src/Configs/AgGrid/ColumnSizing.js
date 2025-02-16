export const ColumnSizing = {
    /**
     * @param minWidth : 100
     * @param columnLimits : [
     *                 {
     *                     colId: "country",
     *                     minWidth: 900,
     *                 },
     *             ],
     * @returns {{type: string, defaultMinWidth: number, columnLimits: [{colId: string, minWidth: number}]}}
     */
    autoSizeStrategy: (minWidth = 100, columnLimits = []) => {
        return {
            type: "fitGridWidth",
            defaultMinWidth: minWidth,
            columnLimits: columnLimits,
        };
    },
}
