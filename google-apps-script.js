/**
 * =====================================================
 * GOOGLE APPS SCRIPT — EVENT REGISTRATION
 * =====================================================
 *
 * HOW TO SET UP:
 * 1. Go to https://sheets.google.com and create a new spreadsheet.
 * 2. Name the sheet tab: "Registrations" (important!)
 * 3. Add these headers to Row 1 (exactly as written):
 *    Timestamp | Name | Roll Number | Phone | College | Event Name | Event Date | Selected Events
 * 4. Click  Extensions → Apps Script
 * 5. Delete any existing code and paste THIS entire file.
 * 6. Save (Ctrl+S / Cmd+S).
 * 7. Click  Deploy → New deployment
 *    - Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 8. Click Deploy → copy the Web App URL.
 * 9. Paste the URL into app.js where it says GOOGLE_SCRIPT_URL.
 *
 * DONE! Test by submitting the form.
 * =====================================================
 */

// Name of the sheet tab
const SHEET_NAME = 'Registrations';

/**
 * Handles POST requests from the registration form.
 */
function doPost(e) {
    try {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = spreadsheet.getSheetByName(SHEET_NAME);

        // Auto-create sheet if it doesn't exist
        if (!sheet) {
            sheet = spreadsheet.insertSheet(SHEET_NAME);
            // Add headers
            sheet.appendRow([
                'Timestamp',
                'Name',
                'Roll Number',
                'Phone',
                'College',
                'Event Name',
                'Event Start Date',
                'Event End Date',
                'Selected Events',
            ]);
            // Style headers
            const headerRange = sheet.getRange(1, 1, 1, 9);
            headerRange.setFontWeight('bold');
            headerRange.setBackground('#4f46e5');
            headerRange.setFontColor('#ffffff');
        }

        // Parse incoming JSON body
        const data = JSON.parse(e.postData.contents);

        // Append a new row
        sheet.appendRow([
            data.timestamp || new Date().toLocaleString(),
            data.name || '',
            data.roll || '',
            data.phone || '',
            data.college || '',
            data.eventName || '',
            data.eventStartDate || '',
            data.eventEndDate || '',
            data.selectedEvents || '',
        ]);

        // Return success response
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'success' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        // Return error response
        return ContentService
            .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handles GET requests (for testing via browser URL).
 */
function doGet() {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', message: 'Event Registration API is live.' }))
        .setMimeType(ContentService.MimeType.JSON);
}
