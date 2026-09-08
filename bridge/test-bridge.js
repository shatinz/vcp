/**
 * Automated Verification Test for VCP Antigravity Bridge
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const server = require('./server');

const TEST_PORT = 8765;
const TEST_HOST = '127.0.0.1';

function request(method, pathName, data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const req = http.request({
      hostname: TEST_HOST,
      port: TEST_PORT,
      path: pathName,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload ? Buffer.byteLength(payload) : 0
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting VCP Bridge automated verification tests...');

  try {
    // 1. Test GET /health
    console.log('1. Testing GET /health ...');
    const health = await request('GET', '/health');
    if (health.statusCode !== 200 || health.data?.status !== 'ok') {
      throw new Error(`Healthcheck failed: ${JSON.stringify(health)}`);
    }
    console.log('   ✓ Healthcheck OK: status=200, server="VCP Antigravity Bridge"');

    // 2. Test GET /api/projects
    console.log('2. Testing GET /api/projects ...');
    const projects = await request('GET', '/api/projects');
    if (projects.statusCode !== 200 || !projects.data?.recentProjects) {
      throw new Error(`Projects check failed: ${JSON.stringify(projects)}`);
    }
    console.log('   ✓ Projects endpoint OK, activeProject:', projects.data.activeProject);

    // 3. Test POST /api/feedback
    console.log('3. Testing POST /api/feedback (Mock Prompt Dispatch) ...');
    const mockPayload = {
      projectPath: 'C:\\prj\\vcp',
      url: 'https://myshop.dev/products/shoes',
      origin: 'https://myshop.dev',
      normalizedPath: '/products/shoes',
      filterMode: 'current',
      macroPrompt: 'Make sure high contrast accessibility rules are met across all updated buttons.',
      pins: [
        {
          index: 1,
          url: 'https://myshop.dev/products/shoes',
          normalizedPath: '/products/shoes',
          prompt: 'Change button background to #059669 and increase font size to 18px.',
          anchor: {
            tagName: 'button',
            testId: 'add-to-cart-btn',
            stableId: 'buy-now',
            cssSelector: 'main > div.product-card > button.btn-primary',
            xpath: '/html/body/main/div[1]/button',
            textQuote: { exact: 'Add to Cart - $99' },
            computedStyles: {
              color: 'rgb(255, 255, 255)',
              backgroundColor: 'rgb(59, 130, 246)',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex'
            },
            outerHtml: '<button data-testid="add-to-cart-btn" class="btn-primary">Add to Cart - $99</button>'
          }
        },
        {
          index: 2,
          url: 'https://myshop.dev/products/shoes',
          normalizedPath: '/products/shoes',
          prompt: 'Align product title left and fix mobile text wrap.',
          anchor: {
            tagName: 'h1',
            cssSelector: 'h1.product-title',
            textQuote: { exact: 'Ultralight Running Shoes' },
            computedStyles: {
              color: 'rgb(15, 23, 42)',
              fontSize: '28px',
              fontWeight: '700',
              display: 'block'
            }
          }
        }
      ]
    };

    const feedbackRes = await request('POST', '/api/feedback', mockPayload);
    if (feedbackRes.statusCode !== 200 || !feedbackRes.data?.success) {
      throw new Error(`Feedback submission failed: ${JSON.stringify(feedbackRes)}`);
    }

    const savedFile = feedbackRes.data.savedFile;
    const rootPrompt = feedbackRes.data.rootPrompt;
    console.log('   ✓ Feedback endpoint OK! File generated at:', savedFile);

    // 4. Assert files exist on disk
    console.log('4. Verifying generated files on disk ...');
    if (!fs.existsSync(savedFile)) {
      throw new Error(`Expected file does not exist: ${savedFile}`);
    }
    if (!fs.existsSync(rootPrompt)) {
      throw new Error(`Expected root prompt file does not exist: ${rootPrompt}`);
    }

    const content = fs.readFileSync(savedFile, 'utf8');
    if (!content.includes('Change button background to #059669')) {
      throw new Error('File content missing pin prompt 1');
    }
    if (!content.includes('Align product title left')) {
      throw new Error('File content missing pin prompt 2');
    }
    if (!content.includes('high contrast accessibility rules')) {
      throw new Error('File content missing macro prompt');
    }
    console.log('   ✓ File content successfully validated with all prompt metadata!');

    console.log('\n🎉 ALL AUTOMATED VERIFICATION TESTS PASSED!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    server.close(() => process.exit(0));
  }
}

// Start server and run tests
server.listen(TEST_PORT, TEST_HOST, () => {
  runTests();
});
