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
        b.addresses = [
          {
            channel: 'email',
            address: `barista-${b.id}@barista.ru`
          },
          {
            channel: 'phone',
            address: `7${`${b.id}`.padEnd(10,b.id.toString())}`
          },
          {
            channel: 'tg',
            address: `${`${b.id}`.padEnd(6,b.id.toString())}`
          },
          {
            channel: 'chat',
            address: crypto.randomUUID()
          }
        ].slice(0,Math.ceil(Math.random()*5));

        fs.writeFileSync(filePath, JSON.stringify(b, null, 2), 'utf8');
        console.log(`JSON file "${filePath}" created successfully.`);


        const filePath1 = path.resolve(`./barista-search-one/${b.id}.json`);
        fs.writeFileSync(filePath1, JSON.stringify({results: [b]}, null, 2), 'utf8');
        console.log(`JSON file "${filePath1}" created successfully.`);

      } catch (err) {
        console.error('Error writing JSON file:', err);
      }
    })
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
  }
});