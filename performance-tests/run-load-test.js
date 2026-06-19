const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;
const DURATION = 60; // 60 seconds (1 minute)
const CONNECTIONS = 100; // 100 virtual users

function checkServer() {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/api/health`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

function runAutocannon(url, name) {
  return new Promise((resolve, reject) => {
    console.log(`\n======================================================`);
    console.log(`Starting baseline load test for ${name}`);
    console.log(`URL: ${url}`);
    console.log(`Connections (Virtual Users): ${CONNECTIONS}`);
    console.log(`Duration: ${DURATION} seconds`);
    console.log(`======================================================\n`);

    const instance = autocannon({
      url,
      connections: CONNECTIONS,
      duration: DURATION,
      pipelining: 1,
    }, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });

    autocannon.track(instance, { renderProgressBar: true });
  });
}

function formatResults(healthResult, productsResult) {
  const timestamp = new Date().toLocaleString();
  return `# Performance Load Test Report
Generated on: ${timestamp}

## Test Parameters
*   **Virtual Users (Connections)**: ${CONNECTIONS}
*   **Duration**: ${DURATION} seconds per endpoint
*   **Target Host**: ${BASE_URL}

## Results Summary

| Endpoint | Total Requests | Total Sent | Avg RPS | Avg Latency | Min Latency | Max Latency | 97.5% Latency | 99% Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Health Check (\`/api/health\`)**<br>_Database-independent_ | ${healthResult.requests.total} | ${formatBytes(healthResult.throughput.total)} | ${healthResult.requests.average} req/sec | ${healthResult.latency.average} ms | ${healthResult.latency.min} ms | ${healthResult.latency.max} ms | ${healthResult.latency.p97_5} ms | ${healthResult.latency.p99} ms |
| **Products List (\`/api/products\`)**<br>_Database-dependent_ | ${productsResult.requests.total} | ${formatBytes(productsResult.throughput.total)} | ${productsResult.requests.average} req/sec | ${productsResult.latency.average} ms | ${productsResult.latency.min} ms | ${productsResult.latency.max} ms | ${productsResult.latency.p97_5} ms | ${productsResult.latency.p99} ms |

---

## Detailed Latency Breakdown

### Health Check (\`/api/health\`)
*   **Average**: ${healthResult.latency.average} ms
*   **Min**: ${healthResult.latency.min} ms
*   **Max**: ${healthResult.latency.max} ms
*   **50% (Median)**: ${healthResult.latency.p50} ms
*   **90%**: ${healthResult.latency.p90} ms
*   **99%**: ${healthResult.latency.p99} ms

### Products List (\`/api/products\`)
*   **Average**: ${productsResult.latency.average} ms
*   **Min**: ${productsResult.latency.min} ms
*   **Max**: ${productsResult.latency.max} ms
*   **50% (Median)**: ${productsResult.latency.p50} ms
*   **90%**: ${productsResult.latency.p90} ms
*   **99%**: ${productsResult.latency.p99} ms

## Observations & Analysis
*   **RPS Comparison**: The database-independent endpoint handled **${healthResult.requests.average} RPS** compared to the database-dependent endpoint's **${productsResult.requests.average} RPS**.
*   **Latency Profile**: Under a continuous load of 100 concurrent connections, the average latency for retrieving products is **${productsResult.latency.average} ms** (with MongoDB Atlas queries and schema mapping overhead), while the health check responds in **${healthResult.latency.average} ms** on average.
`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  const running = await checkServer();
  if (!running) {
    console.error(`Error: Backend server is not running on ${BASE_URL}.`);
    console.error(`Please run the server before executing this script (e.g., using "npm run dev-backend" or "node server.js" in the backend directory).`);
    process.exit(1);
  }

  try {
    const healthResult = await runAutocannon(`${BASE_URL}/api/health`, 'Health Check');
    const productsResult = await runAutocannon(`${BASE_URL}/api/products`, 'Products List');

    const reportContent = formatResults(healthResult, productsResult);

    const reportsDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const reportPath = path.join(reportsDir, 'performance_report.md');
    fs.writeFileSync(reportPath, reportContent);

    console.log(`\n======================================================`);
    console.log(`Baseline load testing complete!`);
    console.log(`Report successfully written to: ${reportPath}`);
    console.log(`======================================================\n`);
  } catch (error) {
    console.error('An error occurred during load testing:', error);
    process.exit(1);
  }
}

main();
