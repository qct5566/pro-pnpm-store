//此文件放到业务工程中
const path = require("path")
const fs = require("fs")
const { spawn } = require("child_process")
//获取根路径
const dirName = __dirname.split("\\")
const root = `${dirName[0]}\\`
//获取本工程路径(本文件必须放在src/utils下)
const currentproPath = path.join(__dirname, "../..").replace(/\\/g, '/')

//获取仓库路径
const pnpmStorePath = path.join(root, "data-platform-pnpm-store")

const registry = '--registry=http://192.168.81.5:8081/repository/npm-all/'

const writeCuttentToPnpmStore = () => {
    // 在仓库的record文件中写入本工程路径
    console.log('仓库路径', pnpmStorePath)
    console.log('本工程路径', currentproPath)
    const { writeRecord } = require(`${pnpmStorePath}/utils/record`)
    writeRecord('childProPath', [currentproPath])
    console.log('====== 写入本工程路径 ======')
}

const spawnPromise = (cmdInfo, callback) => {
    // 执行spawn方法
    const { cmd, arg, option } = cmdInfo
    const npmFun = cmd || (process.platform === 'win32' ? 'npm.cmd' : 'npm')
    const fumName = `npm ${arg[0]} ${arg[1]}`
    console.log(`======= 开始执行${fumName} =======`)
    const cmdFun = spawn(npmFun, arg, option || { cwd: pnpmStorePath })
    cmdFun.stdout.on('data', (data) => {
        console.log(`${data}`)
    });

    cmdFun.stderr.on('data', (data) => {
        console.error(`${data}`);
    });

    cmdFun.on('close', (code) => {
        if (code !== 0) {
            console.log(`${fumName}错误，进程退出，退出码 ${code}`);
        } else {
            // 结束后回调
            if (callback) callback()
        }
    });
}

/**
 * 仓库流程
 */
const pnpmStoreShell = () => {
    const installRimarf = { arg: ['install', 'rimraf', registry] }
    const doClean = { arg: ['run', 'clean'] }
    const installPnpm = { arg: ['install', 'pnpm@5.9.0'] }
    const doSetChild = { arg: ['run', 'set-child'] }
    const doChildInstall = { arg: ['run', 'child-install'] }
    const doChildBuild = { arg: ['run', 'child-build'] }
    const date1 = new Date()
    spawnPromise(installRimarf, () => {
        const date2 = new Date()
        console.log(`${installRimarf}耗时${date2 - date1}`)
        writeCuttentToPnpmStore()
        spawnPromise(doClean, () => {
            const date3 = new Date()
            console.log(`npm run clean 耗时${date3 - date2}`)
            spawnPromise(installPnpm, () => {
                //在仓库工程写入本工程路径
                writeCuttentToPnpmStore()
                const date4 = new Date()
                console.log(`npm install pnpm@5.9.0 耗时${date4 - date3}`)
                spawnPromise(doSetChild, () => {
                    const date5 = new Date()
                    console.log(`npm run set-child 耗时${date5 - date4}`)
                    spawnPromise(doChildInstall, () => {
                        const date6 = new Date()
                        console.log(`npm run child-install 耗时${date6 - date5}`)
                        spawnPromise(doChildBuild, () => {
                            const { writeRecord } = require(`${pnpmStorePath}/utils/record`)
                            writeRecord('childProPath', [])
                            console.log(`npm run child-build 耗时${date6 - date5}`)
                            console.log(`总耗时${date6 - date1}`)
                        })
                    })
                })
            })
        })
    })
}

const copyFolder = (from, to) => { // 复制文件夹到指定目录
    let files = []
    if (fs.existsSync(to)) { // 文件是否存在 如果不存在则创建
        files = fs.readdirSync(from)
        files.forEach(function (file, index) {
            var targetPath = from + '/' + file
            var toPath = to + '/' + file
            if (fs.statSync(targetPath).isDirectory()) { // 复制文件夹
                copyFolder(targetPath, toPath)
            } else { // 拷贝文件
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
    return new Promise((resolve) => {
        const option = { cwd: pnpmStorePath }
        const packageName = 'data-platform-pnpm-store'
        const installPnpmStore = { arg: ['install', packageName, registry], option }
        //判断是否存在仓库目录
        if (fs.existsSync(pnpmStorePath) && fs.statSync(pnpmStorePath).isDirectory()) {
            //存在
            console.log('仓库已存在')
            //仓库存在删除package.json
            const files =fs.readdirSync(pnpmStorePath)
            if(files.includes('package.json')){
                fs.unlinkSync(`${pnpmStorePath}/package.json`);
            }
        } else {
            //不存在
            console.log('仓库不存在,安装仓库时间较长请等待')
            //不存在 创建空文件夹
            fs.mkdirSync(pnpmStorePath)
        }
        console.log('pnpmStorePath',pnpmStorePath)
        console.log(`======= 开始执行npm install ${packageName} =======`)
        spawnPromise(installPnpmStore, () => {
            console.log(`===== 开始安装pnpm仓库 ======`)
            const scourPath = `${pnpmStorePath}/node_modules/${packageName}`
            const targetPath = pnpmStorePath
            copyFolder(scourPath, targetPath)
            console.log(`===== pnpm仓库安装完毕 ======`)
            resolve()
        })
    })
}

/**
 * 
 * @param {string} packageName 要替换依赖名称 
 * @param {string} newPackageName 要替换的字段，包含版本号的完整字符串（不需要写,) 
 * @param {Function} callback  回调
 */
const replacePnpmStoreDep = (packageName, newPackageName, callback) => {
    //删除package.json中的仓库依赖，避免重复添加
    const file = path.join('.', 'package.json')
    fs.readFile(file, "utf8", function (err, data) {
        const depList = data.split('\n')
        //获取包在第几行
        const packageIndex = depList.findIndex(e => e.indexOf(`"${packageName}"`) !== -1) || ''
        //判断是否最后一个包名
        const lastPackage = depList[packageIndex + 1].indexOf('}') !== -1
        if (!newPackageName) {
            if (lastPackage) {
                //如果是最后一项且要清空,删除上一项的逗号
                depList[packageIndex - 1] = depList[packageIndex - 1].replace(',', '')
            }
            depList.splice(packageIndex, 1)
        } else {
            const PackageName = lastPackage ? newPackageName : `${newPackageName},`
            depList[packageIndex] = PackageName
        }
        const newPackJson = depList.join('\n')
        // writeFile改写文件内容
        fs.writeFile(file, newPackJson, "utf8", function (err) {
            if (err) return console.log(err);
            if (callback) callback()
        });
        // }
    });
}


downloadPnpmStore().then(() => {
    //删除从项目中删除pnpm仓库的依赖包
    // replacePnpmStoreDep('data-platform-pnpm-store', '', () => {
        //执行仓库流程
        pnpmStoreShell()
    // })
})