const fs = require('fs');
try {
    const xlsx = require('xlsx');
    const workbook = xlsx.readFile('docs/Danh sách xã phường cùng dân số và diện tích.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    fs.writeFileSync('data/demographics.json', JSON.stringify(data, null, 2), 'utf8');
    console.log('SUCCESS');
} catch (e) {
    console.error('ERROR:', e.message);
}
