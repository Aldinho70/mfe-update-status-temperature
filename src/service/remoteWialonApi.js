const BASE_URL = "https://hst-api.wialon.com/wialon/ajax.html";

export class WialonReportService {

    constructor(sid) {
        this.sid = sid;
    }

    async execReport({ resourceId, reportId, unitId, from, to }) {
        const params = {
            reportResourceId: resourceId,
            reportTemplateId: reportId,
            reportObjectId: unitId,
            reportObjectSecId: 0,
            interval: {
                from,
                to,
                flags: 0
            }
        };

        const { data } = await axios.get(BASE_URL, {
            params: {
                svc: "report/exec_report",
                params: JSON.stringify(params),
                sid: this.sid
            }
        });

        return data;
    }

    async getResultRows({
        tableIndex = 0,
        indexFrom = 0,
        indexTo = 1000
    }) {

        const { data } = await axios.get(BASE_URL, {
            params: {
                svc: "report/get_result_rows",
                params: JSON.stringify({
                    tableIndex,
                    indexFrom,
                    indexTo
                }),
                sid: this.sid
            }
        });

        return data;
    }

}