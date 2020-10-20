//推送本工程到私服，每次推送增加一个小版本
const fs = require('fs')
const path = require('path')
const { exec } = require("child_process")

// package路径
const packagePath = path.join(__dirname, '../package.json');

fs.readFile(packagePath, "utf8", function (err, data) {
    const versionIndex = data.indexOf("version");
    if (versionIndex !== -1) {
        const version = data.substring(versionIndex).split(",")[0];
        const currentVersion = version.replace(/"/g, '').split(':')
        const currentVersionNum = currentVersion[1].trim().split('.')
        const largeNum = +currentVersionNum[0]
        const centerNum = +currentVersionNum[1]
        const smallNum = +currentVersionNum[2]
        const newSmallNum = smallNum < 9 ? smallNum + 1 : 0
        const newCenterNum = smallNum === 9 ? centerNum < 9 ? centerNum + 1 : 0 : centerNum
        const newLargeNum = smallNum === 9 && newCenterNum === 0 ? largeNum + 1 : largeNum
        const newVersion = `${newLargeNum}.${newCenterNum}.${newSmallNum}`
        const newPackJson = data.replace(
            version,
            `version": "${newVersion}"`
        )
        // writeFile改写文件内容
        fs.writeFile(packagePath, newPackJson, "utf8", function (err) {
            if (err) return console.log(err);
            console.log('当前版本号', currentVersion[1])
            exec('npm publish', function (error, stdout, stderr) {
                // console.log(`stdout: ${stdout}`)
                // console.log(`stdout: ${stderr}`)
                if (error || stdout.indexOf('Error') !== -1) {
                    console.error(error);
                } else {
                    console.log(`===== 推送完毕 ======`)
                    console.log('已升级版本号到', newVersion)
                }
            })
        })
    }
})
