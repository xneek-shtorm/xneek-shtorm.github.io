const fs = require('fs');
const path = require('path');

fs.readFile('./barista-array.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  try {
    const jsonData = JSON.parse(data);
    jsonData.forEach((b) => {
      try {
        const filePath = path.resolve(`./barista/${b.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(b, null, 2), 'utf8');
        console.log(`JSON file "${filePath}" created successfully.`);
      } catch (err) {
        console.error('Error writing JSON file:', err);
      }
    })
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
  }
});