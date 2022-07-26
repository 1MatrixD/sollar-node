const coordBody = document.querySelector('#coords-table');

function clearCordBody() {
    coordBody.innerHTML = '';
}

async function showCoordData(squares) {
    try {
        if (!Array.isArray(squares)) {
            return;
        }

        clearCordBody();
        
        let text = '';
        
        for (const square of squares) {
            const generateElements = generateCoordsElements(square.id, ...square && square.square);

            text += generateElements;
        }

        coordBody.innerHTML = text;
    } catch (err) {
        console.error(err);
    }
}

function generateCoordsElements(id, v1, v2, v3, v4) {
    let result = `
        <tr>
            <td>${id}</td>
            <td>${v1}</td>
            <td>${v2}</td>
            <td>${v3}</td>
            <td>${v4}</td>
        </tr>
    `;

    return result;
}

function addCoordData(vectors) {
    coordBody.innerHTML += '<tr>';

    for (const data of vectors) {
        coordBody.innerHTML += '<td>' + data + '</td>';
    }

    coordBody.innerHTML += '</tr>';
}