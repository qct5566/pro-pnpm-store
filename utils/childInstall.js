const { spawn } = require('child_process')
const getPath = require('./getPath')
const { record } = require('./record')

const spawnPromise = (cmd, callback) => {
  console.log(`===== 开始执行${cmd.fun} ======`)
  const cmdFun = spawn(cmd.fun, cmd.arg)
  cmdFun.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  cmdFun.stderr.on('data', (data) => {
    console.error(`${cmdFun} 的 stderr: ${data}`)
  })

  cmdFun.on('close', (code) => {
    if (code !== 0) {
      console.log(`${cmdFun} 进程退出，退出码 ${code}`)
    } else {
      if (callback) callback()
    }
  })
}

// 获取业务工程配置的自定义构建
const { config } = record
const customBuild = config.allConfig.customBuild
const { isAllBuild, skipInstall } = config

getPath.relativeChildProPath.forEach(e => {
  const skipPro = isAllBuild ? customBuild.findIndex(custom => {
    // 获取名称模糊匹配且install设置为false的跳过此流程
    return e.indexOf(custom.pro) !== -1 && !custom.install
  }) !== -1 : skipInstall
  if (!skipPro) {
    const cmd = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
    const cmdInstall = { fun: cmd, arg: ['recursive', 'exec', `--filter=${e}`, 'pnpm update'] }
    spawnPromise(cmdInstall)
  } else {
    console.log(`已跳过 ${e} 的install流程`)
  }
})
