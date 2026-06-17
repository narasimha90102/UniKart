const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function consolidate() {
  console.log('Consolidating reports...');
  const webReportPath = path.join(__dirname, 'reports/web_test_report.xlsx');
  const mobileReportPath = path.join(__dirname, '../appium-tests/reports/mobile_test_report.xlsx');

  const consolidatedWorkbook = new ExcelJS.Workbook();

  // Load and copy Web Report
  if (fs.existsSync(webReportPath)) {
    const webWorkbook = new ExcelJS.Workbook();
    await webWorkbook.xlsx.readFile(webReportPath);
    webWorkbook.eachSheet((sheet) => {
      const newSheet = consolidatedWorkbook.addWorksheet('Web E2E Tests');
      copySheetData(sheet, newSheet);
    });
    console.log('Added Web E2E Tests sheet.');
  } else {
    console.warn('Web report not found at:', webReportPath);
  }

  // Load and copy Mobile Report
  if (fs.existsSync(mobileReportPath)) {
    const mobileWorkbook = new ExcelJS.Workbook();
    await mobileWorkbook.xlsx.readFile(mobileReportPath);
    mobileWorkbook.eachSheet((sheet) => {
      const newSheet = consolidatedWorkbook.addWorksheet('Mobile E2E Tests');
      copySheetData(sheet, newSheet);
    });
    console.log('Added Mobile E2E Tests sheet.');
  } else {
    console.warn('Mobile report not found at:', mobileReportPath);
  }

  const outputDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save as both LifeLink_Test_Report.xlsx and UniKart_Test_Report.xlsx
  const lifeLinkPath = path.join(outputDir, 'LifeLink_Test_Report.xlsx');
  const uniKartPath = path.join(outputDir, 'UniKart_Test_Report.xlsx');

  await consolidatedWorkbook.xlsx.writeFile(lifeLinkPath);
  await consolidatedWorkbook.xlsx.writeFile(uniKartPath);

  console.log(`Consolidated reports saved successfully:\n - ${lifeLinkPath}\n - ${uniKartPath}`);
}

function copySheetData(sourceSheet, destSheet) {
  // Copy columns
  destSheet.columns = sourceSheet.columns.map(col => ({
    header: col.header,
    key: col.key,
    width: col.width,
    style: col.style
  }));

  // Copy rows and cell values/styles/merges
  sourceSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const destRow = destSheet.getRow(rowNumber);
    destRow.height = row.height;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const destCell = destRow.getCell(colNumber);
      destCell.value = cell.value;
      destCell.style = cell.style;
    });
  });

  // Copy merges
  if (sourceSheet._merges) {
    Object.values(sourceSheet._merges).forEach(merge => {
      destSheet.mergeCells(merge.model.top, merge.model.left, merge.model.bottom, merge.model.right);
    });
  }
}

consolidate().catch(console.error);
