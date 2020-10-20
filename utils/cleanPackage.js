const { deleteFolderByRimRaf, getAllChildPath } = require("./fileUtil");

//删除特定的依赖包，防止内容更新版本号未更新
const delDepList = ['data-platform-common-frontend']
delDepList.forEach(dep => {
    const cmd = `pnpm update ${e}`
    exec(cmd, function (error, stdout, stderr) {
        if (error) {
            console.error(error);
        } else {
            console.log(`====== ${e}打包成功 ======`)
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
        }
    })
})


const pnpmStorePath = path.join(__dirname, '../pnpm');
delDepList.forEach(package => {
    console.log(`获取需要单独删除的包路径`)
    const allDepPath = getAllChildPath(pnpmStorePath, package)
    console.log(`获取的包路径${allDepPath}`)
    allDepPath.forEach(depPath => {
        console.log(`开始删除依赖包`)
        deleteFolderByRimRaf(depPath, () => {
            console.log(`成功删除${depPath}包`)
        })
    })
})
