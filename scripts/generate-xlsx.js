const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tempDir = '/tmp/xlsx_temp';
const outputFile = '/Users/ken/Desktop/SDCode/SZFuture/SZFuture/docs/template.xlsx';

// 清理临时目录
if (fs.existsSync(tempDir)) {
  execSync(`rm -rf ${tempDir}`);
}
fs.mkdirSync(tempDir, { recursive: true });

// 创建 [Content_Types].xml
fs.writeFileSync(path.join(tempDir, '[Content_Types].xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
</Types>`);

// 创建 _rels/.rels
fs.mkdirSync(path.join(tempDir, '_rels'));
fs.writeFileSync(path.join(tempDir, '_rels/.rels'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);

// 创建 xl/workbook.xml
fs.mkdirSync(path.join(tempDir, 'xl'));
fs.writeFileSync(path.join(tempDir, 'xl/workbook.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`);

// 创建 xl/_rels/workbook.xml.rels
fs.mkdirSync(path.join(tempDir, 'xl/_rels'));
fs.writeFileSync(path.join(tempDir, 'xl/_rels/workbook.xml.rels'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`);

// 创建 xl/worksheets/sheet1.xml
fs.mkdirSync(path.join(tempDir, 'xl/worksheets'));
fs.writeFileSync(path.join(tempDir, 'xl/worksheets/sheet1.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData/>
</worksheet>`);

// 创建 xl/sharedStrings.xml
fs.writeFileSync(path.join(tempDir, 'xl/sharedStrings.xml'), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="0" uniqueCount="0"/>`);

// 打包成 ZIP (XLSX)
execSync(`cd ${tempDir} && zip -r ${outputFile} *`);

console.log('XLSX file created successfully:', outputFile);