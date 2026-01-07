#!/usr/bin/env node
const { execSync } = require('child_process');
const readline = require('readline');

// 创建命令行交互实例
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * 执行系统命令并返回结果
 * @param {string} cmd - 要执行的系统命令
 * @returns {string} 命令执行结果
 */
function executeCmd(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

/**
 * 根据端口号查询进程信息（Windows 专用）
 * @param {number} port - 要查询的端口号
 * @returns {Array} 进程信息数组，格式：[{ pid: '1234', name: 'node' }]
 */
function getProcessByPort(port) {
  const cmd = `netstat -ano | findstr ":${port}"`;
  const result = executeCmd(cmd);
  if (!result) return [];

  const processes = [];
  const lines = result.split('\n');
  const seenPids = new Set();

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const parts = trimmedLine.split(/\s+/);
    const pid = parts[parts.length - 1];

    if (pid && !seenPids.has(pid)) {
      seenPids.add(pid);
      const nameResult = executeCmd(`tasklist /FI "PID eq ${pid}" /FO LIST | findstr "Image Name"`);
      const name = nameResult.split(':')[1]?.trim() || '未知进程';
      processes.push({ pid, name });
    }
  }

  return processes;
}

/**
 * 终止指定 PID 的进程（Windows 专用）
 * @param {string} pid - 要终止的进程 ID
 * @returns {boolean} 终止成功返回 true，失败返回 false
 */
function killProcess(pid) {
  try {
    executeCmd(`taskkill /F /PID ${pid}`);
    return true;
  } catch (error) {
    console.error(`❌ 终止进程 ${pid} 失败：${error.message}`);
    return false;
  }
}

// 主流程
async function main() {
  // 1. 询问用户输入端口号
  rl.question('请输入要查询的端口号：', (portInput) => {
    // 2. 验证端口号合法性
    const port = parseInt(portInput.trim(), 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      console.error('❌ 错误：请输入合法的端口号（1-65535）');
      rl.close();
      return;
    }

    // 3. 查询端口对应的进程
    console.log(`🔍 正在查询端口 ${port} 对应的进程...`);
    const processes = getProcessByPort(port);

    if (processes.length === 0) {
      console.log(`✅ 端口 ${port} 未被占用`);
      rl.close();
      return;
    }

    // 4. 展示查询结果
    console.log(`\n📋 端口 ${port} 对应的进程信息：`);
    processes.forEach((proc, index) => {
      console.log(`${index + 1}. PID: ${proc.pid}，进程名：${proc.name}`);
    });

    // 5. 询问是否终止进程
    rl.question('\n是否终止以上所有进程？（y/n，默认n）：', (answer) => {
      const confirm = answer.trim().toLowerCase() === 'y';
      if (!confirm) {
        console.log('✅ 已取消终止操作');
        rl.close();
        return;
      }

      // 6. 执行终止操作
      console.log('\n🗡️  正在终止进程...');
      processes.forEach(proc => {
        const success = killProcess(proc.pid);
        console.log(success 
          ? `✅ 进程 ${proc.pid}（${proc.name}）终止成功` 
          : `❌ 进程 ${proc.pid}（${proc.name}）终止失败`
        );
      });

      rl.close();
    });
  });

  // 监听交互关闭事件
  rl.on('close', () => {
    console.log('\n👋 操作结束，退出脚本');
    process.exit(0);
  });
}

// 启动主流程
main();
