export const Table = (data = {}) => {

    return `
        <div class="table-wrapper">

            <table class="table table-hover table-bordered table-striped-columns align-middle shadow-sm mb-0">

                <thead class="table-dark">

                    <tr>
                        ${
                            data?.headers?.length
                                ? data.headers.map(header => `
                                    <th scope="col" class="text-center fw-semibold fs-6 text-uppercase py-3">
                                        ${header}
                                    </th>
                                `).join('')
                                : `
                                    <th scope="col">1</th>
                                    <th scope="col">2</th>
                                    <th scope="col">3</th>
                                `
                        }
                    </tr>

                </thead>

                <tbody class="bg-white">

                    ${
                        data?.body
                            ? data.body
                            : `
                                <tr class="">
                                    <td colspan="${data?.headers?.length || 1}" class="text-center py-4 text-muted ">
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            `
                    }

                </tbody>

            </table>

        </div>
    `;
}