# Performance Load Test Report
Generated on: 19/6/2026, 11:20:41 am

## Test Parameters
*   **Virtual Users (Connections)**: 100
*   **Duration**: 60 seconds per endpoint
*   **Target Host**: http://localhost:5000

## Results Summary

| Endpoint | Total Requests | Total Sent | Avg RPS | Avg Latency | Min Latency | Max Latency | 97.5% Latency | 99% Latency |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Health Check (`/api/health`)**<br>_Database-independent_ | 463698 | 423.2 MB | 7729.1 req/sec | 12.44 ms | 1 ms | 132 ms | 27 ms | 37 ms |
| **Products List (`/api/products`)**<br>_Database-dependent_ | 1090 | 33.21 MB | 18.17 req/sec | 4911.76 ms | 1953 ms | 9941 ms | 7008 ms | 8139 ms |

---

## Detailed Latency Breakdown

### Health Check (`/api/health`)
*   **Average**: 12.44 ms
*   **Min**: 1 ms
*   **Max**: 132 ms
*   **50% (Median)**: 11 ms
*   **90%**: 15 ms
*   **99%**: 37 ms

### Products List (`/api/products`)
*   **Average**: 4911.76 ms
*   **Min**: 1953 ms
*   **Max**: 9941 ms
*   **50% (Median)**: 4784 ms
*   **90%**: 6862 ms
*   **99%**: 8139 ms

## Observations & Analysis
*   **RPS Comparison**: The database-independent endpoint handled **7729.1 RPS** compared to the database-dependent endpoint's **18.17 RPS**.
*   **Latency Profile**: Under a continuous load of 100 concurrent connections, the average latency for retrieving products is **4911.76 ms** (with MongoDB Atlas queries and schema mapping overhead), while the health check responds in **12.44 ms** on average.
