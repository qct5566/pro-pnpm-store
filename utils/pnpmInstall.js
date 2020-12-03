// 此文件放到业务工程src/utils下,或者修改相对路径等级
const path = require('path')
const fs = require('fs')
const os = require('os')
const { spawn } = require('child_process')

/* 获取根目录 */
// 判断系统
const isWindow = os.platform() === 'win32'
let root = ''
if (isWindow) {
  const dirName = __dirname.split('\\')
  root = `${dirName[0]}\\`
} else {
  const userDir = os.homedir()
  root = `${userDir}/`
}

// 获取业务工程路径
const currentproPath = path.join(__dirname, '../..').replace(/\\/g, '/')
// 获取仓库路径
const pnpmStoreName = 'data-platform-pnpm-store'
const pnpmStorePath = path.join(root, pnpmStoreName)

/**
 * 打包相关配置,所有配置区分大小写
 * 配置路径时分隔符使用/
 */
const config = {
  isAllBuild: false, // 是否将所有相关工程打包,设置为true时，统一使用build中的配置，注意相关工程配置
  allConfig: { // 多工程打包相关配置,只有isAllBuild为true时，才会生效
    childProPath:[
      // 'F:/QCT/work/linewell/dgp/data-platform-basic-project/basic-frontend'
    ],  // 子工程列表,必须使用系统完整路径 
    build: 'npm run build-copy', // package.json 中的打包命令,为空或false时统一不打包，会被customBuild中的配置覆盖
    proFlag: {
      // 统一打包构建时，配置工程名模糊匹配标识,想要切换规则，修改此处即可
      // 例 data-platform-basic-project/basic-frontend 和 data-platform-frontend/frontend
      // 自动匹配 *data-platform*/*frontend* 并寻找此路径下是否存在package.json
      pro: 'data-platform', // 整个工程的名称必须包含
      frontendPro: 'frontend', // 前端工程必须包含
      frontendProFile: 'package.json' // 前端工程文件标识
    },
    customBuild: [ // 统一打包时,需要设置某个工程的独立配置，会覆盖统一的配置
      // 仓库工程默认不执行流程，
      // data-platform-frontend/frontend是依赖工程，无需加入打包构建,建议有改动时手动执行publish
      // 此项不配置的情况下，也是默认不执行data-platform-frontend/frontend流程
      {
        pro: 'data-platform-frontend/frontend', // 模糊匹配前端工程名称，必须符合proFlag的规则
        install: false, // 是否执行install
        build: false // 是否执行build，类型为boolean或string, 类型为string时和build相同
      }
    ]
  },
  skipInstall: false, // 跳过install步骤
  skipBuild: false, // 跳过build步骤
  build: 'npm run build-copy', // 本工程打包命令
  root, // 根路径
  currentproPath, // 当前业务工程路径
  pnpmStorePath, // 仓库路径
  pnpmStoreName, // 仓库依赖名称
  registry: '--registry=http://192.168.81.5:8081/repository/npm-all/', // 源命令
  update: true, // 每次启动是否更新仓库(将依赖中的文件覆盖到本地仓库)
  cmd: isWindow ? 'npm.cmd' : 'npm' // 不同操作系统环境的npm命令
}

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
  const cmdFun = spawn(npmFun, arg, option || { cwd: config.pnpmStorePath })
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

const copyFolder = (from, to) => {
  // 复制文件夹到指定目录
  let files = []
  if (fs.existsSync(to)) {
    // 文件是否存在 如果不存在则创建
    files = fs.readdirSync(from)
    files.forEach(function (file, index) {
      var targetPath = from + '/' + file
      var toPath = to + '/' + file
      if (fs.statSync(targetPath).isDirectory()) {
        // 复制文件夹
        copyFolder(targetPath, toPath)
      } else {
        // 拷贝文件
        fs.copyFileSync(targetPath, toPath)
      }
    })
  } else {
    fs.mkdirSync(to)
    copyFolder(from, to)
  }
}

const downloadPnpmStore = () => {
  // 下载pnpm仓库
  return new Promise(resolve => {
    const startDate = new Date()
    const { pnpmStorePath, update, pnpmStoreName, registry } = config
    // 仓库的包名称
    const installPnpmStore = {
      arg: ['install', pnpmStoreName, registry]
    }
    // 判断是否存在仓库目录
    const hasPnpmStorePath = fs.existsSync(pnpmStorePath) && fs.statSync(pnpmStorePath).isDirectory()
    if (hasPnpmStorePath) {
      // 存在
      console.log('仓库目录已存在')
      if (update) {
        console.log('开始更新仓库')
        // 仓库存在且允许更新则删除package.json
        const files = fs.readdirSync(pnpmStorePath)
        if (files.includes('package.json')) {
          fs.unlinkSync(`${pnpmStorePath}/package.json`)
        }
      } else {
        console.log('已设置不更新仓库')
      }
    } else {
      // 不存在
      console.log('仓库不存在,安装仓库时间较长请等待')
      // 不存在 创建空文件夹
      fs.mkdirSync(pnpmStorePath)
    }
    if (update || !hasPnpmStorePath) {
      console.log('开始安装和更新仓库')
      console.log(`======= 开始执行npm install ${pnpmStoreName} =======`)
      spawnPromise(installPnpmStore, () => {
        console.log(`===== 开始安装pnpm仓库 ======`)
        const scourPath = `${pnpmStorePath}/node_modules/${pnpmStoreName}`
        const targetPath = pnpmStorePath
        copyFolder(scourPath, targetPath)
        console.log(`===== pnpm仓库安装完毕 ======`)
        resolve(startDate)
      })
    } else {
      console.log(`===== 已设置不更新仓库，跳过安装仓库流程 ======`)
      resolve(startDate)
    }
  })
}

const writeCuttentToPnpmStore = (key, value) => {
  return new Promise(resolve => {
    // 在仓库的record文件中写入本工程配置
    console.log('仓库路径', config.pnpmStorePath)
    const { writeRecord } = require(`${config.pnpmStorePath}/utils/record`)
    writeRecord(key, value).then(() => {
      console.log('====== 写入本工程配置 ======')
      resolve()
    })
  })
}

downloadPnpmStore().then(startDate => {
  // 开始执行pnpm仓库流程
  writeCuttentToPnpmStore('config', { ...config, startDate }).then(() => {
    writeCuttentToPnpmStore('childProPath', config.isAllBuild ? [] : [config.currentproPath]).then(() => {
      const pnpmStoreCmd = { arg: ['run', 'pnpm-process'] }
      spawnPromise(pnpmStoreCmd, () => {
        // console.log('====== 开始执行仓库流程 ======')
      })
    })
  })
})

// 执行完所有流程后
// 需要手动更新本工程包命令
// pnpm add {package@version}
// 需要手动更新仓库包命令
// pnpm store add {package@version}
