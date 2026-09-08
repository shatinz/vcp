/**
 * Visual Click Prompt (VCP) - Antigravity Localhost Bridge Server
 * Runs a standalone HTTP daemon on 127.0.0.1:8765 with zero external dependencies.
 * Receives visual in-context prompts and writes structured task briefs directly
 * into target Antigravity project workspaces.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const HOST = '127.0.0.1';

// Default target project workspace
let activeProject = process.env.VCP_PROJECT || 'C:\\prj\\vcp';
const recentProjects = new Set([activeProject, 'C:\\prj\\pdf-anki-sync']);

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON: ' + err.message));
      }
    });
    req.on('error', reject);
  });
}

function generateMarkdownPrompt(payload) {
  const { url, normalizedPath, macroPrompt, pins, projectPath } = payload;
  const timestamp = new Date().toISOString();

  let md = `# 🎯 Visual Click Prompt — In-Context Task Brief\n\n`;
  md += `> **Generated on:** \`${timestamp}\`  \n`;
  md += `> **Target Page:** [${url}](${url}) (\`${normalizedPath}\`)  \n`;
  md += `> **Project Workspace:** \`${projectPath}\`  \n`;
  md += `> **Total Annotated Elements:** **${pins.length}**\n\n`;

  if (macroPrompt && macroPrompt.trim()) {
    md += `## 📢 Macro / Overall Directive\n`;
    md += `> ${macroPrompt.trim().replace(/\n/g, '\n> ')}\n\n`;
    md += `---\n\n`;
  }

  md += `## 📌 Element Modification Details\n\n`;

  pins.forEach((pin, i) => {
    const anchor = pin.anchor || {};
    const tagName = anchor.tagName || 'element';
    const selector = anchor.cssSelector || anchor.xpath || 'Unknown Selector';
    const textSnippet = anchor.textQuote ? anchor.textQuote.exact : '';
    const testId = anchor.testId || anchor.stableId || null;

    md += `### Pin #${pin.index || (i + 1)}: \`<${tagName}>\`\n`;
    md += `- **User Instruction / Prompt:** **${pin.prompt}**\n`;
    md += `- **Selector:** \`${selector}\`\n`;
    if (testId) {
      md += `- **Identifier (TestID/ID):** \`${testId}\`\n`;
    }
    if (textSnippet) {
      md += `- **Text Context:** "${textSnippet}"\n`;
    }
    if (anchor.xpath) {
      md += `- **XPath:** \`${anchor.xpath}\`\n`;
    }
    if (anchor.computedStyles) {
      const s = anchor.computedStyles;
      md += `- **Computed Styles:** \`color: ${s.color}; bg: ${s.backgroundColor}; font: ${s.fontSize} (${s.fontWeight}); display: ${s.display}\`\n`;
    }
    if (anchor.outerHtml) {
      md += `\n\`\`\`html\n${anchor.outerHtml}\n\`\`\`\n`;
    }
    md += `\n---\n\n`;
  });

  md += `## 🤖 Antigravity Execution Instructions\n`;
  md += `1. Locate the corresponding component files or styles in the codebase using the selectors, test IDs, and text snippets listed above.\n`;
  md += `2. Implement each pin's requested modifications accurately.\n`;
  md += `3. Maintain responsive layouts, clean code, and zero regressions.\n`;
  md += `4. Verify changes against the target page.\n`;

  return md;
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url, `http://${req.headers.host || HOST}`);
  const pathname = reqUrl.pathname;

  try {
    // GET /health
    if (req.method === 'GET' && (pathname === '/health' || pathname === '/')) {
      return sendJson(res, 200, {
        status: 'ok',
        server: 'VCP Antigravity Bridge',
        version: '1.0.0',
        activeProject: activeProject,
        isProjectValid: fs.existsSync(activeProject),
        port: PORT,
        timestamp: Date.now()
      });
    }

    // GET /api/projects
    if (req.method === 'GET' && pathname === '/api/projects') {
      return sendJson(res, 200, {
        activeProject,
        recentProjects: Array.from(recentProjects),
        isProjectValid: fs.existsSync(activeProject)
      });
    }

    // POST /api/project
    if (req.method === 'POST' && pathname === '/api/project') {
      const data = await parseJsonBody(req);
      if (data.projectPath) {
        activeProject = path.resolve(data.projectPath);
        recentProjects.add(activeProject);
        if (!fs.existsSync(activeProject)) {
          fs.mkdirSync(activeProject, { recursive: true });
        }
        return sendJson(res, 200, {
          success: true,
          activeProject,
          isProjectValid: true
        });
      } else {
        return sendJson(res, 400, { success: false, error: 'Missing projectPath' });
      }
    }

    // POST /api/feedback
    if (req.method === 'POST' && pathname === '/api/feedback') {
      const payload = await parseJsonBody(req);
      const targetPath = path.resolve(payload.projectPath || activeProject);
      activeProject = targetPath;
      recentProjects.add(targetPath);

      if (!payload.pins || !Array.isArray(payload.pins) || payload.pins.length === 0) {
        return sendJson(res, 400, { success: false, error: 'No pins provided in payload' });
      }

      // Ensure directory structure in target project
      const tasksDir = path.join(targetPath, '.gemini', 'tasks');
      const humanTasksDir = path.join(targetPath, 'tasks');
      fs.mkdirSync(tasksDir, { recursive: true });
      fs.mkdirSync(humanTasksDir, { recursive: true });

      const fileTimestamp = Date.now();
      const jsonFileName = `feedback-${fileTimestamp}.json`;
      const mdFileName = `task-${fileTimestamp}.md`;

      const jsonFilePath = path.join(tasksDir, jsonFileName);
      const mdFilePath = path.join(tasksDir, mdFileName);
      const rootPromptPath = path.join(targetPath, 'FEEDBACK_PROMPT.md');
      const inboxPath = path.join(targetPath, 'agent_inbox.md');

      const markdownContent = generateMarkdownPrompt(payload);

      // Write machine JSON
      fs.writeFileSync(jsonFilePath, JSON.stringify(payload, null, 2), 'utf8');

      // Write task markdown
      fs.writeFileSync(mdFilePath, markdownContent, 'utf8');

      // Write root FEEDBACK_PROMPT.md (always latest in workspace)
      fs.writeFileSync(rootPromptPath, markdownContent, 'utf8');

      // Append summary to agent_inbox.md
      const inboxEntry = `\n## [${new Date().toLocaleString()}] Visual Feedback (${payload.pins.length} items on ${payload.url})\n` +
        `Task File: [${mdFileName}](file:///${mdFilePath.replace(/\\/g, '/')})\n` +
        (payload.macroPrompt ? `Directive: ${payload.macroPrompt}\n` : '') +
        `Summary: ${payload.pins.map(p => `#${p.index} <${p.anchor?.tagName}>: ${p.prompt}`).join('; ')}\n`;
      fs.appendFileSync(inboxPath, inboxEntry, 'utf8');

      console.log(`[VCP Bridge] Successfully written task for ${payload.pins.length} pins to ${mdFilePath}`);

      let agentTriggered = false;
      let agentLogFile = null;

      // Auto-trigger Antigravity Agent autonomously via `agy` CLI
      if (payload.autoTrigger) {
        try {
          const { spawn } = require('child_process');
          const agyLogName = `agent-run-${fileTimestamp}.log`;
          agentLogFile = path.join(tasksDir, agyLogName);
          const logStream = fs.createWriteStream(agentLogFile, { flags: 'a' });

          const promptDirective = `Please read the visual feedback tasks in ${mdFilePath} (and FEEDBACK_PROMPT.md) and implement all requested modifications in this codebase. Maintain clean code and verify your changes.`;

          console.log(`[VCP Bridge] 🤖 Auto-triggering Antigravity CLI (agy) in: ${targetPath}`);

          const child = spawn('agy', ['-p', promptDirective, '--dangerously-skip-permissions'], {
            cwd: targetPath,
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true
          });

          child.stdout.pipe(logStream);
          child.stderr.pipe(logStream);

          child.on('error', (err) => {
            console.error('[VCP Agent Spawn Error]', err);
          });

          child.on('close', (code) => {
            console.log(`[VCP Agent] Autonomous run finished with exit code ${code}`);
          });

          child.unref();
          agentTriggered = true;
        } catch (spawnErr) {
          console.error('[VCP Bridge] Failed to auto-trigger agy:', spawnErr);
        }
      }

      return sendJson(res, 200, {
        success: true,
        savedFile: mdFilePath,
        relativeTask: path.join('.gemini', 'tasks', mdFileName),
        rootPrompt: rootPromptPath,
        taskCount: payload.pins.length,
        timestamp: fileTimestamp,
        agentTriggered,
        agentLogFile
      });
    }

    // GET /api/agent-status
    if (req.method === 'GET' && pathname === '/api/agent-status') {
      return sendJson(res, 200, {
        status: 'ok',
        agyAvailable: true
      });
    }

    // 404
    sendJson(res, 404, { success: false, error: 'Endpoint not found' });
  } catch (err) {
    console.error('[VCP Bridge Error]', err);
    sendJson(res, 500, { success: false, error: err.message });
  }
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`🚀 VCP Antigravity Bridge Daemon running`);
    console.log(`📍 URL: http://${HOST}:${PORT}`);
    console.log(`📁 Active Workspace: ${activeProject}`);
    console.log(`====================================================`);
  });
}

// Handle graceful termination
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

module.exports = server;
