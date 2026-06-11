const fs = require('fs');
const readline = require('readline');

async function run() {
  const fileStream = fs.createReadStream('scratch/vercel_logs_24h.json');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  console.log('🔍 Searching logs...');
  let matchCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      // The file might contain lines that are not valid JSON or header lines from Vercel CLI
      if (!line.startsWith('{')) {
        continue;
      }
      const log = JSON.parse(line);
      
      const text = JSON.stringify(log);
      const hasDigest = text.includes('1792026837');
      const is500 = log.responseStatusCode === 500;
      const hasError = log.level === 'error' && !text.includes('SECURITY WARNING') && !text.includes('sslmode');
      
      if (hasDigest || is500 || hasError) {
        matchCount++;
        console.log(`\n----------------------------------------`);
        console.log(`Time: ${new Date(log.timestamp).toISOString()}`);
        console.log(`Path: ${log.requestMethod} ${log.requestPath}`);
        console.log(`Status: ${log.responseStatusCode}`);
        console.log(`Message: ${log.message}`);
        if (log.logs && log.logs.length > 0) {
          console.log(`Logs:`);
          log.logs.forEach(l => {
            console.log(`  [${l.level}] ${l.message}`);
          });
        }
      }
    } catch (err) {
      // ignore parse errors
    }
  }

  console.log(`\n🏁 Search completed. Found ${matchCount} matches.`);
}

run().catch(console.error);
