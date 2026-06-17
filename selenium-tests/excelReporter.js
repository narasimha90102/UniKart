const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Generates a styled Excel report for E2E tests.
 * @param {Array} results Array of test result objects: { id, name, module, status, duration, error }
 * @param {String} outputFileName Name of the output file
 */
async function generateExcelReport(results, outputFileName = 'web_test_report.xlsx') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('E2E Web Test Report');

  // Calculate statistics
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status.toUpperCase() === 'PASS').length;
  const failedTests = totalTests - passedTests;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%';

  // 1. Add Title Block
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'UNIKART WEB E2E AUTOMATION TEST REPORT';
  titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF6366F1' } // Purple/Indigo brand color
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 40;

  // 2. Add Summary Cards block
  worksheet.getCell('A3').value = 'Summary Information:';
  worksheet.getCell('A3').font = { name: 'Segoe UI', size: 11, bold: true };

  const summaryHeaders = ['Total Executed', 'Passed', 'Failed', 'Success Rate'];
  const summaryValues = [totalTests, passedTests, failedTests, passRate];

  for (let i = 0; i < summaryHeaders.length; i++) {
    const colIndex = i + 1;
    const cellHeader = worksheet.getCell(4, colIndex);
    const cellValue = worksheet.getCell(5, colIndex);

    cellHeader.value = summaryHeaders[i];
    cellHeader.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF4B5563' } };
    cellHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    cellHeader.alignment = { horizontal: 'center' };

    cellValue.value = summaryValues[i];
    cellValue.font = { name: 'Segoe UI', size: 11, bold: true };
    cellValue.alignment = { horizontal: 'center' };

    // Apply colors to values based on status
    if (summaryHeaders[i] === 'Passed') {
      cellValue.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF10B981' } };
    } else if (summaryHeaders[i] === 'Failed') {
      cellValue.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFEF4444' } };
    } else if (summaryHeaders[i] === 'Success Rate') {
      cellValue.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF4F46E5' } };
    }
  }

  // Draw border around summary box
  worksheet.getRow(4).height = 20;
  worksheet.getRow(5).height = 22;

  // 3. Setup Table Headers
  const tableStartRow = 7;
  const headers = [
    { name: 'Test ID', width: 12 },
    { name: 'Module', width: 18 },
    { name: 'Test Case Name', width: 35 },
    { name: 'Status', width: 12 },
    { name: 'Duration', width: 15 },
    { name: 'Executed At', width: 22 },
    { name: 'Error / Failure Details', width: 45 }
  ];

  headers.forEach((h, idx) => {
    const cell = worksheet.getCell(tableStartRow, idx + 1);
    cell.value = h.name;
    cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Dark Slate header
    };
    cell.alignment = { vertical: 'middle', horizontal: idx === 3 ? 'center' : 'left' };
  });
  worksheet.getRow(tableStartRow).height = 25;

  // 4. Fill Table Data
  results.forEach((res, index) => {
    const rowIdx = tableStartRow + 1 + index;
    const row = worksheet.getRow(rowIdx);
    row.height = 22;

    const cells = [
      worksheet.getCell(rowIdx, 1), // ID
      worksheet.getCell(rowIdx, 2), // Module
      worksheet.getCell(rowIdx, 3), // Name
      worksheet.getCell(rowIdx, 4), // Status
      worksheet.getCell(rowIdx, 5), // Duration
      worksheet.getCell(rowIdx, 6), // Timestamp
      worksheet.getCell(rowIdx, 7)  // Error
    ];

    cells[0].value = res.id;
    cells[1].value = res.module;
    cells[2].value = res.name;
    cells[3].value = res.status.toUpperCase();
    cells[4].value = `${res.duration} ms`;
    cells[5].value = new Date().toLocaleString();
    cells[6].value = res.error || '';

    // Apply Zebra striping background
    const isEven = index % 2 === 0;
    const bgHex = isEven ? 'FFFFFFFF' : 'FFF8FAFC';
    cells.forEach((c, idx) => {
      c.font = { name: 'Segoe UI', size: 10 };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
      c.border = {
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });

    // Formatting Status (PASS/FAIL)
    cells[3].alignment = { horizontal: 'center' };
    if (res.status.toUpperCase() === 'PASS') {
      cells[3].font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF065F46' } }; // Dark Green
      cells[3].fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };    // Light Green
    } else {
      cells[3].font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } }; // Dark Red
      cells[3].fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FEE2E2' } };     // Light Red
      cells[6].font = { name: 'Segoe UI', size: 9, color: { argb: 'FFEF4444' } };
    }
  });

  // Set column widths based on metadata
  headers.forEach((h, idx) => {
    worksheet.getColumn(idx + 1).width = h.width;
  });

  // 5. Save report
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const outputPath = path.join(reportsDir, outputFileName);
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Report generated successfully at: ${outputPath}`);
  return outputPath;
}

module.exports = { generateExcelReport };
