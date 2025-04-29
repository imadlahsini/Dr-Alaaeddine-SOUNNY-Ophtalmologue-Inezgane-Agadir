function doPost(e) {
  // C'est important de traiter les requêtes CORS
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Tenter de traiter les données reçues
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    output.setContent(JSON.stringify({ 
      success: false, 
      error: "JSON invalide: " + err.toString() 
    }));
    return output;
  }

  try {
    var spreadsheetId = '';// your Google Sheet ID
    var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('reservation');

   // If the 'reservation' or whatecer  sheet doesn't exist, create it and add headers
    if (!sheet) {
      sheet = SpreadsheetApp.openById(spreadsheetId).insertSheet('reservation');
      sheet.appendRow(["Timestamp", "Nom", "Téléphone", "Date", "Créneau Horaire","langue"]);
    }

    sheet.appendRow([
      new Date(),
      data.name,
      data.phone,
      data.date,
      data.timeSlot,
      data.language
    ]);

    output.setContent(JSON.stringify({ success: true }));
    return output;

  } catch (err) {
    output.setContent(JSON.stringify({ 
      success: false, 
      error: err.toString() 
    }));
    return output;
  }
}

function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);
  return output;
}

///
The google-sheet-script.gs file contains the script to be pasted into the Google Apps Script editor (linked to your Google Sheet) to receive data from the application.

Go to your Google Sheet → Extensions → Apps Script

Paste the code from google-sheet-script.gs

Deploy as a web service (run as the owner, accessible to everyone)


