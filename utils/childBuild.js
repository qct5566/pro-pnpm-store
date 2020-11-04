const { exec } = require('child_process')
const getPath = require('./getPath')
const { record } = require('./record')

// 获取业务工程配置的自定义构建
const { config } = record
const customBuild = config.allConfig.customBuild
const { build, isAllBuild, skipBuild } = config

getPath.relativeChildProPath.forEach(e => {
  const customConfig = customBuild.find(custom => e.indexOf(custom.pro) !== -1) || { build: config.allConfig.build }
  const skipPro = isAllBuild ? !customConfig.build : skipBuild
  const endBuild = isAllBuild ? customConfig.build : build
  if (!skipPro) {
    console.log(`====== 开始打包${e} ======`)
    const cmd = `pnpm recursive exec --filter ${e} ${endBuild}`
    exec(cmd, function (error, stdout, stderr) {
      if (error) {
        console.error(error)
      } else {
        console.log(`====== ${e}打包成功 ======`)
        console.log(`stdout: ${stdout}`)
        console.log(`stderr: ${stderr}`)
      }
    })
  } else {
    console.log(`已跳过 ${e} 的build流程`)
  }
})
