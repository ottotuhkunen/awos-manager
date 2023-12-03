// airtable connection variables
const apiKey = 'patJsIQxjCob9ynp1.7ab138658eed30ec035a53b5f8a0446cb4e65dc93ec29b8fbc7a9d9adca6a9ef';
const baseUrl = 'https://api.airtable.com/v0/appGAYI2wFvY7jZVG/Table%201';

// data variables
let rwycc;
let graded;
let contaminants;
let contaminantDepth;
let taxiwayConditions;
let apronConditions;
let runwayClearedWidth;
let infoWindow1;
let infoWindow2;
let infoWindow3;
let metWarningsText;
let runway15clsd;
let runway04Lclsd;
let runway04Rclsd;
let infoWindowLines = {};
let warningLines = {};
let comment_rcr;
let comment_snowtam;
let comment_twy;
let comment_apn;


// fetch data from Airtable:
async function fetchData() {
    const headers = new Headers({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    });

    try {
        const response = await fetch(baseUrl, { headers });
        const data = await response.json();

        for (let record of data.records) {
            // infowindow 1 (04L)
            if (record.fields['Name'] && record.fields['Name'].startsWith('infowindow_04L')) {
                infoWindowLines[record.fields['Name']] = record.fields['content'];
            }
            infoWindow1 = (infoWindowLines['infowindow_04L line1'] || "") +
            (infoWindowLines['infowindow_04L line2'] ? "\n" + infoWindowLines['infowindow_04L line2'] : "") +
            (infoWindowLines['infowindow_04L line3'] ? "\n" + infoWindowLines['infowindow_04L line3'] : "");

            // infowindow 2 (22L)
            if (record.fields['Name'] && record.fields['Name'].startsWith('infowindow_22L')) {
                infoWindowLines[record.fields['Name']] = record.fields['content'];
            }
            infoWindow2 = (infoWindowLines['infowindow_22L line1'] || "") +
            (infoWindowLines['infowindow_22L line2'] ? "\n" + infoWindowLines['infowindow_22L line2'] : "") +
            (infoWindowLines['infowindow_22L line3'] ? "\n" + infoWindowLines['infowindow_22L line3'] : "");
            
            // infowindow 3 (33)
            if (record.fields['Name'] && record.fields['Name'].startsWith('infowindow_33')) {
                infoWindowLines[record.fields['Name']] = record.fields['content'];
            }
            infoWindow3 = (infoWindowLines['infowindow_33 line1'] || "") +
            (infoWindowLines['infowindow_33 line2'] ? "\n" + infoWindowLines['infowindow_33 line2'] : "") +
            (infoWindowLines['infowindow_33 line3'] ? "\n" + infoWindowLines['infowindow_33 line3'] : "");

            // rwycc and upgraded/downgraded values
            if (record.fields['Name'] === 'rwycc_all_rwys') rwycc = record.fields['content'];
            if (record.fields['Name'] === 'rwycc_all_rwys') graded = record.fields['rwycc_upgr_dngr'];
            // contaminants and depth
            if (record.fields['Name'] === 'contaminants') contaminants = record.fields['content'];
            if (record.fields['Name'] === 'contaminants') contaminantDepth = record.fields['rwycc_upgr_dngr'];
            // taxiway- and apron conditions
            if (record.fields['Name'] === 'twyConditions') taxiwayConditions = record.fields['content'];
            if (record.fields['Name'] === 'apronConditions') apronConditions = record.fields['content'];
            // runway cleared width
            if (record.fields['Name'] === 'rwyWidth') runwayClearedWidth = record.fields['content'];
            // MET Warnings
            if (record.fields['Name'] && record.fields['Name'].startsWith('warnings')) {
                warningLines[record.fields['Name']] = record.fields['content'];
            }
            metWarningsText = (warningLines['warnings'] || "") +
            (warningLines['warnings_line_2'] ? "\n" + warningLines['warnings_line_2'] : "");

            // runway status (open/closed)
            if (record.fields['Name'] === 'rwy_04L_clsd') runway04Lclsd = record.fields['content'];
            if (record.fields['Name'] === 'rwy_04R_clsd') runway04Rclsd = record.fields['content'];
            if (record.fields['Name'] === 'rwy_15_clsd') runway15clsd = record.fields['content'];

            // comments
            if (record.fields['Name'] === 'rcrComments') comment_rcr = record.fields['content'];
            if (record.fields['Name'] === 'snowtamComments') comment_snowtam = record.fields['content'];
            if (record.fields['Name'] === 'taxiwayComments') comment_twy = record.fields['content'];
            if (record.fields['Name'] === 'apronComments') comment_apn = record.fields['content'];
        }
        


    } catch (error) {
        console.error('Failed to fetch data from Airtable:', error);
    }
    // display variables
    document.getElementById("infoWindow1").value = infoWindow1;
    document.getElementById("infoWindow2").value = infoWindow2;
    document.getElementById("infoWindow3").value = infoWindow3;
    document.getElementById("rwycc").value = rwycc;
    document.getElementById("upgr_dngr").value = graded;
    document.getElementById("contaminants").value = contaminants;
    document.getElementById("depth").value = contaminantDepth;
    document.getElementById("twyConditions").value = taxiwayConditions;
    document.getElementById("apnConditions").value = apronConditions;
    document.getElementById("clearedWidth").value = runwayClearedWidth;
    document.getElementById("warningsWindow").value = metWarningsText;
    document.getElementById("rwy04LClosed").value = runway04Lclsd;
    document.getElementById("rwy04RClosed").value = runway04Rclsd;
    document.getElementById("rwy15Closed").value = runway15clsd;
    document.getElementById("rcrComment").value = comment_rcr;
    document.getElementById("snowtamComment").value = comment_snowtam;
    document.getElementById("taxiwayComment").value = comment_twy;
    document.getElementById("apronComment").value = comment_apn;

}

// Call the fetchData function when the page loads
window.onload = fetchData;

async function pushConditionData() {
    // push RWYCC, upgr/dngr, contaminant, depth, cleared width and twy/apn conditions
    const recordMap = await fetchRecordIds();
    const rwyccValue = document.getElementById('rwycc').value;
    const gradeValue = document.getElementById('upgr_dngr').value;
    const depthValue = document.getElementById('depth').value;
    const contaminantsValue = document.getElementById('contaminants').value;
    const twyConditionsValue = document.getElementById('twyConditions').value;
    const apnConditionsValue = document.getElementById('apnConditions').value;
    const widthValue = document.getElementById('clearedWidth').value;

    saveToAirtable(recordMap.get('rwycc_all_rwys'), 'rwycc_all_rwys', rwyccValue);
    saveToAirtable(recordMap.get('contaminants'), 'contaminants', contaminantsValue);
    saveToAirtable(recordMap.get('twyConditions'), 'twyConditions', twyConditionsValue);
    saveToAirtable(recordMap.get('apronConditions'), 'apronConditions', apnConditionsValue);
    saveToAirtable(recordMap.get('rwyWidth'), 'rwyWidth', widthValue);

    saveToAirtableSecondColumn(recordMap.get('rwycc_all_rwys'), 'rwycc_all_rwys', gradeValue);
    saveToAirtableSecondColumn(recordMap.get('contaminants'), 'contaminants', depthValue);
}

function pushInformationData() {
    // push operational information and MET Warnings
    const infoWindow1 = document.getElementById('infoWindow1').value;
    const infoWindow2 = document.getElementById('infoWindow2').value;
    const infoWindow3 = document.getElementById('infoWindow3').value;
    const metWarningWindow = document.getElementById('warningsWindow').value;
    
    setinfoWindow1(infoWindow1);
    setinfoWindow2(infoWindow2);
    setinfoWindow3(infoWindow3);
    setMetWarnings(metWarningWindow);
}

async function pushRunwayStatusData() {
    // push runway status (opened or closed)
    const recordMap = await fetchRecordIds();
    const rwy04L = document.getElementById('rwy04LClosed').value;
    const rwy04R = document.getElementById('rwy04RClosed').value;
    const rwy15 = document.getElementById('rwy15Closed').value;
    const recordId1 = recordMap.get('rwy_04L_clsd');
    const recordId2 = recordMap.get('rwy_04R_clsd');
    const recordId3 = recordMap.get('rwy_15_clsd');

    saveToAirtable(recordId1, 'rwy_04L_clsd', rwy04L);
    saveToAirtable(recordId2, 'rwy_04R_clsd', rwy04R);
    saveToAirtable(recordId3, 'rwy_15_clsd', rwy15); 
}

async function setinfoWindow1(infoWindow1Value) {
    const recordMap = await fetchRecordIds();

    if (!infoWindow1Value.trim() || infoWindow1Value.trim() === '...') {
        const recordId1 = recordMap.get('infowindow_04L line1');
        const recordId2 = recordMap.get('infowindow_04L line2');
        const recordId3 = recordMap.get('infowindow_04L line3');
        saveToAirtable(recordId1, 'infowindow_04L line1', '...');
        saveToAirtable(recordId2, 'infowindow_04L line2', '');
        saveToAirtable(recordId3, 'infowindow_04L line3', '');
    } else {
        const lines = infoWindow1Value.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const fieldName = `infowindow_04L line${i + 1}`;
            const fieldValue = lines[i].trim();
            const recordId = recordMap.get(fieldName);
            if (recordId) { // Check if ID exists
                saveToAirtable(recordId, fieldName, fieldValue);
            } else {
                console.log(`Record ID not found for ${fieldName}`);
            }
        }
    }
}

async function setinfoWindow2(infoWindowValue) {
    const recordMap = await fetchRecordIds();

    if (!infoWindowValue.trim() || infoWindowValue.trim() === '...') {
        const recordId1 = recordMap.get('infowindow_22L line1');
        const recordId2 = recordMap.get('infowindow_22L line2');
        const recordId3 = recordMap.get('infowindow_22L line3');
        saveToAirtable(recordId1, 'infowindow_22L line1', '...');
        saveToAirtable(recordId2, 'infowindow_22L line2', '');
        saveToAirtable(recordId3, 'infowindow_22L line3', '');
    } else {
        const lines = infoWindowValue.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const fieldName = `infowindow_22L line${i + 1}`;
            const fieldValue = lines[i].trim();
            const recordId = recordMap.get(fieldName);
            if (recordId) { // Check if ID exists
                saveToAirtable(recordId, fieldName, fieldValue);
            } else {
                console.log(`Record ID not found for ${fieldName}`);
            }
        }
    }
}

async function setinfoWindow3(infoWindowValue) {
    const recordMap = await fetchRecordIds();

    if (!infoWindowValue.trim() || infoWindowValue.trim() === '...') {
        const recordId1 = recordMap.get('infowindow_33 line1');
        const recordId2 = recordMap.get('infowindow_33 line2');
        const recordId3 = recordMap.get('infowindow_33 line3');
        saveToAirtable(recordId1, 'infowindow_33 line1', '...');
        saveToAirtable(recordId2, 'infowindow_33 line2', '');
        saveToAirtable(recordId3, 'infowindow_33 line3', '');
    } else {
        const lines = infoWindowValue.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const fieldName = `infowindow_33 line${i + 1}`;
            const fieldValue = lines[i].trim();
            const recordId = recordMap.get(fieldName);
            if (recordId) { // Check if ID exists
                saveToAirtable(recordId, fieldName, fieldValue);
            } else {
                console.log(`Record ID not found for ${fieldName}`);
            }
        }
    }
}

async function setMetWarnings(infoWindowValue) {
    const recordMap = await fetchRecordIds();

    if (!infoWindowValue.trim() || infoWindowValue.trim() === '...') {
        const recordId1 = recordMap.get('warnings');
        const recordId2 = recordMap.get('warnings_line_2');
        saveToAirtable(recordId1, 'warnings', '...');
        saveToAirtable(recordId2, 'warnings_line_2', '');
    } else {
        const lines = infoWindowValue.split('\n');
        const recordId1 = recordMap.get('warnings');
        const recordId2 = recordMap.get('warnings_line_2');
        saveToAirtable(recordId1, 'warnings', lines[0]);
        saveToAirtable(recordId2, 'warnings_line_2', lines[1] ? lines[1] : '');
    }
}

function pushCommentData() {
    // push operational information and MET Warnings
    const commentRCR = document.getElementById('rcrComment').value;
    const commentSNOWTAM = document.getElementById('snowtamComment').value;
    const commentTWY = document.getElementById('taxiwayComment').value;
    const commentAPN = document.getElementById('apronComment').value;
    
    setComments(commentRCR, commentSNOWTAM, commentTWY, commentAPN);
    //setinfoWindow2(commentSNOWTAM);
    //setinfoWindow3(commentTWY);
    //setMetWarnings(commentAPN);
}

async function setComments(commentRCR, commentSNOWTAM, commentTWY, commentAPN) {
    const recordMap = await fetchRecordIds();

    const recordId1 = recordMap.get('rcrComments');
    const recordId2 = recordMap.get('snowtamComments');
    const recordId3 = recordMap.get('taxiwayComments');
    const recordId4 = recordMap.get('apronComments');

    saveToAirtable(recordId1, 'rcrComments', commentRCR);
    saveToAirtable(recordId2, 'snowtamComments', commentSNOWTAM);
    saveToAirtable(recordId3, 'taxiwayComments', commentTWY);
    saveToAirtable(recordId4, 'apronComments', commentAPN);
}


function saveToAirtable(recordId, fieldName, fieldValue) {
    const dataToSend = {
        records: [
            {
                id: recordId,
                fields: {
                    'Name': fieldName,
                    'content': fieldValue,
                }
            }
        ]
    };
    
    // console.log(dataToSend);

    const requestOptions = {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    };

        fetch(baseUrl, requestOptions)
        .then(response => response.json())
        .then(data => {
            // console.log('Data updated in Airtable:', data);
        })
        .catch(error => {
            console.error('Error updating data in Airtable:', error);
        });
}

function saveToAirtableSecondColumn(recordId, fieldName, fieldValue) {
    const dataToSend = {
        records: [
            {
                id: recordId,
                fields: {
                    'Name': fieldName,
                    'rwycc_upgr_dngr': fieldValue,
                }
            }
        ]
    };
    
    // console.log(dataToSend);

    const requestOptions = {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    };

        fetch(baseUrl, requestOptions)
        .then(response => response.json())
        .then(data => {
            // console.log('Data updated in Airtable:', data);
        })
        .catch(error => {
            console.error('Error updating data in Airtable:', error);
        });
}

function fetchRecordIds() {
    const requestOptions = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };

    return fetch(`${baseUrl}`, requestOptions)
        .then(response => response.json())
        .then(data => {
            // Assuming 'data.records' is an array of record objects
            const recordMap = new Map();
            data.records.forEach(record => {
                const name = record.fields.Name;
                const id = record.id;
                recordMap.set(name, id);
            });
            return recordMap;
        })
        .catch(error => {
            console.error('Error fetching records:', error);
        });
}
