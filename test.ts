import https from 'https';

https.get('https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/gviz/tq?tqx=out:csv&gid=1613566233&range=B21:E27', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Total Gardu:', data));
});
https.get('https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/gviz/tq?tqx=out:csv&gid=1613566233&range=I21:M27', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Kondisi Trafo:', data));
});
