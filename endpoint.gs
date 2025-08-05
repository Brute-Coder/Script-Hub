function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("warranty");
    const body = JSON.parse(e.postData.contents);

    let {
      fullName,
      phoneNumber,
      serialNumber,
      purchaseDate,
      purchaseFrom
    } = body;

    // Validate required fields
    if (!fullName || !phoneNumber || !purchaseDate || !purchaseFrom) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, message: "Missing required fields." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if(!serialNumber){
      serialNumber = "Not Provided";
    }
    
    // Append to sheet
    sheet.appendRow([
      fullName,
      phoneNumber,
      serialNumber,
      purchaseDate,
      purchaseFrom,
      new Date()  // Submitted At
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Data stored successfully." }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
