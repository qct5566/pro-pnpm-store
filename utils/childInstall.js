const { spawn } = require('child_process')
const getPath = require('./getPath')

const spawnPromise = (cmd, callback) => {
    console.log(`===== 开始执行${cmd.fun} ======`)
    const cmdFun = spawn(cmd.fun, cmd.arg)
    cmdFun.stdout.on('data', (data) => {
        console.log(data.toString())
    });

    cmdFun.stderr.on('data', (data) => {
        console.error(`${cmdFun} 的 stderr: ${data}`);
    });

    cmdFun.on('close', (code) => {
        if (code !== 0) {
            console.log(`${cmdFun} 进程退出，退出码 ${code}`);
        } else {
            if (callback) callback()
        }
    });
}

getPath.relativeChildProPath.forEach(e => {
    const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
    const cmdInstall = { fun: cmd, arg: ['recursive', 'exec', `--filter=${e}`, 'pnpm update'] }
    spawnPromise(cmdInstall)
})