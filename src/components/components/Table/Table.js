export const Table = ( data ) => {
    return `
        <table class="table">
            <thead>
                ${  (data?.headers.length)
                        ? data?.headers.map(header => `<th scope="col">${header}</th>`).join('')
                        : `
                            <th scope="col">1</th>
                            <th scope="col">2</th>
                            <th scope="col">3</th>
                        `
                }
            </thead>
            <tbody> ${data?.body || '<tr><td>No data</td></tr>'} </tbody>
        </table>
    `
} 