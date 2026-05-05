import Papa from 'papaparse';

async function test() {
  const res = await fetch('https://docs.google.com/spreadsheets/d/1IfBQSLlqnJsf2DulM0kw-yTA6zr6Sum75mQOZpGUAJM/export?format=csv&gid=1606832216');
  const text = await res.text();
  Papa.parse(text, {
    complete: (results) => {
      const rows = results.data as string[][];
      for (let i = 39; i <= 52; i++) {
        if (rows[i]) {
          console.log(`Row ${i+1}:`, rows[i].slice(2, 16).join(' | '));
        }
      }
    }
  });
}
test();
