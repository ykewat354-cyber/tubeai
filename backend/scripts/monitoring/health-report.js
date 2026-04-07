/**
 * Monitoring Script — System Health Report
 *
 * Run:
 *   node scripts/monitoring/health-report.js
 *
 * Outputs JSON report with:
 * - System health (API, Redis, DB)
 * - Performance metrics (latencies, error rates)
 * - Memory usage
 * - Queue statistics
 *
 * Cron usage:
 *   Every 5 min: node scripts/monitoring/health-report.js >> logs/health-report.log
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

function fetchJson(path) {
  const url = `${BASE_URL}${path}`;
  const client = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    }).on('error', reject);
  });
}

async function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    checks: {},
    issues: [],
  };

  try {
    // Basic health
    const health = await fetchJson('/api/health');
    report.checks.health = health;
    if (health.status !== 'healthy') {
      report.issues.push(`System status: ${health.status}`);
      if (health.services?.redis === false) report.issues.push('Redis is down');
      if (health.services?.database === false) report.issues.push('Database is down');
    }

    // Detailed health
    const detailed = await fetchJson('/api/health/detailed');
    report.checks.detailed = {
      uptime: detailed.uptime ? `${Math.floor(detailed.uptime / 3600)}h ${Math.floor((detailed.uptime % 3600) / 60)}m` : 'N/A',
      memory: detailed.system?.memory,
      version: detailed.version,
      queue: detailed.queue,
    };

    if (detailed.system?.memory) {
      const heapMB = parseFloat(detailed.system.memory.heapUsed);
      if (heapMB > 500) {
        report.issues.push(`High memory usage: ${detailed.system.memory.heapUsed}`);
      }
    }

    // Metrics
    const metrics = await fetchJson('/api/health/metrics');
    report.checks.metrics = metrics.metrics;

  } catch (err) {
    report.checks.api = { status: 'unreachable', error: err.message };
    report.issues.push('API server is unreachable');
  }

  // Print report
  console.log('\n' + '='.repeat(60));
  console.log('  TubeAI Health Report');
  console.log('='.repeat(60));
  console.log(`  Generated: ${report.timestamp}`);
  console.log(`  Issues: ${report.issues.length}`);

  if (report.issues.length > 0) {
    console.log('\n  ⚠️  ISSUES:');
    report.issues.forEach((issue, i) => {
      console.log(`    ${i + 1}. ${issue}`);
    });
  } else {
    console.log('\n  ✅ No issues detected');
  }

  if (report.checks.health) {
    const h = report.checks.health;
    console.log(`\n  Status: ${h.status}`);
    console.log(`  Uptime: ${h.uptime ? Math.floor(h.uptime / 60) + 'm' : 'N/A'}`);
  }

  if (report.checks.metrics?.latencies) {
    const l = report.checks.metrics.latencies;
    console.log(`\n  Latencies: p50=${l.p50}ms, p95=${l.p95}ms, p99=${l.p99}ms`);
  }

  if (report.checks.metrics?.memory) {
    console.log(`\n  Memory: ${report.checks.metrics.memory.heapUsed} / ${report.checks.metrics.memory.rss} (RSS)`);
  }

  if (report.checks.metrics?.cache) {
    console.log(`\n  Cache hit rate: ${report.checks.metrics.cache.hitRate}`);
  }

  if (report.checks.detailed?.queue) {
    console.log(`\n  Queue: ${JSON.stringify(report.checks.detailed.queue)}`);
  }

  console.log('\n' + '='.repeat(60));

  // Write to file if requested
  return report;
}

generateReport().catch((err) => {
  console.error('Failed to generate health report:', err.message);
  process.exit(1);
});
