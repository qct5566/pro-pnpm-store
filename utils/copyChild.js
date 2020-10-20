//拷贝特定文件给子工程
const path = require('path')
const fs = require('fs')
const getPath = require('./getPath')

// 向工作区子工程复制pnpmInstall文件
getPath.childProPath.forEach((e) => {
    const pnpmInstallSourcePath = path.join(__dirname, "../utils/pnpmInstall.js");
    const pnpmInstallTargetPath = `${e}/src/utils/pnpmInstall.js`
    fs.copyFileSync(pnpmInstallSourcePath, pnpmInstallTargetPath);
})