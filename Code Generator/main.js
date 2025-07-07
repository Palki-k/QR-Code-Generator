const sizes = document.getElementById('sizes');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const input = document.getElementById('file');
const table = document.getElementById('table');

let size = sizes.value;
let allQRData = [];

sizes.addEventListener('change', (e) => {
    size = e.target.value;
});

input.addEventListener('change', (event) => {
    const selectedFile = event.target.files[0];

    readXlsxFile(selectedFile).then((rows) => {
        table.innerHTML = "";
        allQRData = [];

        rows.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            let rowData = [];

            row.forEach((cell) => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
                if (rowIndex !== 0) rowData.push(cell); // Skip header row
            });

            if (rowIndex !== 0) allQRData.push(rowData); // Store row for QR
            table.appendChild(tr);
        });
    });
});

generateBtn.addEventListener('click', (event) => {
    event.preventDefault();

    if (allQRData.length === 0) {
        alert("Please upload a file first.");
        return;
    }

    const zip = new JSZip();

    // Add QR Code header column to the table if not already added
    if (table.rows[0] && table.rows[0].cells.length === table.rows[1].cells.length) {
        const th = document.createElement('th');
        th.textContent = "QR Code";
        table.rows[0].appendChild(th);
    }

    allQRData.forEach((rowArray, rowIndex) => {
        const qrText = rowArray.join(', '); // Join all columns into one string
        const tempDiv = document.createElement('div');

        new QRCode(tempDiv, {
            text: qrText,
            width: parseInt(size),
            height: parseInt(size),
            colorDark: "#000000",
            colorLight: "#ffffff"
        });

        setTimeout(() => {
            const img = tempDiv.querySelector("img");

            if (img) {
                fetch(img.src)
                    .then(res => res.blob())
                    .then(blob => {
                        zip.file(`Row${rowIndex + 1}.png`, blob);

                        const td = document.createElement('td');
                        td.appendChild(img);
                        const row = table.rows[rowIndex + 1]; // +1 to skip header
                        if (row) {
                            row.appendChild(td);
                        }

                        if (rowIndex === allQRData.length - 1) {
                            zip.generateAsync({ type: 'blob' }).then((content) => {
                                downloadBtn.setAttribute("href", URL.createObjectURL(content));
                                downloadBtn.setAttribute("download", "qrcodes.zip");
                            });
                        }
                    });
            }
        }, 100);
    });
});
