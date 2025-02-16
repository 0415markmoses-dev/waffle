export const RowDataUpdate = {
    getRowId: params => {
        if (params.data['@id'] !== undefined) {
            return String(params.data['@id']);
        }
        return String(params.data.id);
    }
}
