// 此文件放到业务工程中
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

// 获取子工程配置，具体见./pnpmInstall
const { record, writeRecord } = require('./record')
const { config } = record
const { pnpmStorePath } = config

/**
 *
 * @param {Object} cmdInfo
 * @param {Function} callback //回调
 * cmdInfo {
 *   @param {string} cmd //spawn执行的cmd命令
 *   @param {arg} arg  //命令参数 例：执行npm run serve，则值为['run','serve']
 *   @param {Object} option // spawn配置，具体见文档，这里默认配置了执行该命令的工程地址cwd为仓库工程
 * }
 */
const spawnPromise = (cmdInfo, callback) => {
  // 执行spawn方法
  const { cmd, arg, option } = cmdInfo
  const npmFun = cmd || config.cmd
  const funName = `${npmFun} ${arg.join().replace(/,/g, ' ')}`
  console.log(`======= 开始执行${funName} =======`)
  const cmdFun = spawn(npmFun, arg, option || { cwd: pnpmStorePath })
  cmdFun.stdout.on('data', data => {
    console.log(`${data}`)
  })

  cmdFun.stderr.on('data', data => {
    console.error(`${data}`)
  })

  cmdFun.on('close', code => {
    if (code !== 0) {
      console.log(`${funName}错误，进程退出，退出码 ${code}`)
    } else {
      // 结束后回调
      if (callback) callback()
    }
  })
}

// 判断目录是否存在
const hasDir = path => {
  return fs.existsSync(path) && fs.statSync(path).isDirectory()
}

/**
 * 仓库流程
 */
const pnpmStoreShell = () => {
  const { registry, startDate } = config
  const nodeModulesPath = `${pnpmStorePath}/node_modules`
  const skip = { arg: ['run', 'skip'] }
  // 判断仓库工程中是否安装rimraf依赖
  const hasRimraf = hasDir(`${nodeModulesPath}/rimraf`)
  const installRimarf = hasRimraf ? skip : { arg: ['install', 'rimraf', registry] }
  // 清除命令
  const doClean = { arg: ['run', 'clean'] }
  // 判断仓库工程中是否安装pnpm依赖
  const hasPnpm = hasDir(`${nodeModulesPath}/pnpm`)
  const installPnpm = hasPnpm ? skip : { arg: ['install', 'pnpm@5.9.0'] }
  // 将相关配置拷贝到子工程
  const doSetChild = { arg: ['run', 'set-child'] }
  // 子工程install命令
  const doChildInstall = { arg: ['run', 'child-install'] }
  // 子工程install命令
  const doChildBuild = { arg: ['run', 'child-build'] }
  spawnPromise(installRimarf, () => {
    console.log(`${hasRimraf ? '跳过' : '执行'} npm install rimraf`)
    spawnPromise(doClean, () => {
      console.log(`执行 npm run clean`)
      // clean时会清除currentproPath配置，这里需要根据config重新写入一次
      writeRecord('childProPath', config.isAllBuild ? [] : [config.currentproPath])
      spawnPromise(installPnpm, () => {
        console.log(`${hasPnpm ? '跳过' : '执行'} npm install pnpm@5.9.0`)
        spawnPromise(doSetChild, () => {
          console.log(`执行 npm run set-child`)
          const date5 = new Date()
          spawnPromise(doChildInstall, () => {
            const date6 = new Date()
            console.log(`执行 npm run child-install 耗时${date6 - date5}`)
            spawnPromise(doChildBuild, () => {
              const date7 = new Date()
              console.log(`执行 npm run child-build 耗时${date7 - date6}`)
              // const { writeRecord } = require(`${pnpmStorePath}/utils/record`)
              // writeRecord('childProPath', [])
              console.log(`总耗时${date7 - new Date(startDate)}`)
            })
          })
        })
      })
    })
  })
}

/**
 * 暂时弃用
 * @param {string} packageName 要替换依赖名称
 * @param {string} newPackageName 要替换的字段，包含版本号的完整字符串（不需要写,)
 * @param {Function} callback  回调
 */
const replacePnpmStoreDep = (packageName, newPackageName, callback) => {
  // 删除package.json中的仓库依赖，避免重复添加
  const file = path.join('.', 'package.json')
  fs.readFile(file, 'utf8', function (err, data) {
    const depList = data.split('\n')
    // 获取包在第几行
    const packageIndex = depList.findIndex(e => e.indexOf(`"${packageName}"`) !== -1) || ''
    // 判断是否最后一个包名
    const lastPackage = depList[packageIndex + 1].indexOf('}') !== -1
    if (!newPackageName) {
      if (lastPackage) {
        // 如果是最后一项且要清空,删除上一项的逗号
        depList[packageIndex - 1] = depList[packageIndex - 1].replace(',', '')
      }
      depList.splice(packageIndex, 1)
    } else {
      const PackageName = lastPackage ? newPackageName : `${newPackageName},`
      depList[packageIndex] = PackageName
    }
    const newPackJson = depList.join('\n')
    // writeFile改写文件内容
    fs.writeFile(file, newPackJson, 'utf8', function (err) {
      if (err) return console.log(err)
      if (callback) callback()
    })
    // }
  })
}

// 执行仓库流程
pnpmStoreShell()
