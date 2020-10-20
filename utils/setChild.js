const fs = require('fs');
const path = require('path');
const getPath = require('./getPath')

const sourcePath = path.join(__dirname, '../.npmrc-child');
//设置子工程的npmrc文件
fs.readFile(sourcePath, 'utf8', (err, data) => {
  console.log("====== 开始设置子工程npmrc文件 =======")
  const newData = data.split('\n')
  const newStoreDir = `store-dir= ${getPath.currentPath}/pnpm/.pnpm-store # 指定依赖项的版本号信息存放位置\r`
  const newVirtualStoreDir = `virtual-store-dir= ${getPath.currentPath}/pnpm/node_modules/.pnpm # 指定工程依赖项的缓存位置\r`
  const storeDirIndex = newData.findIndex(e => e.indexOf('store-dir=') !== -1)
  const virtualStoreDirIndex = newData.findIndex(e => e.indexOf('virtual-store-dir=') !== -1)
  newData[storeDirIndex] = newStoreDir
  newData[virtualStoreDirIndex] = newVirtualStoreDir
  const writeData = newData.join('\n')
  // // writeFile改写文件内容
  fs.writeFile(sourcePath, writeData, 'utf8', function (writeErr) {
    if (writeErr) return console.log(writeErr);
    getPath.childProPath.forEach((e) => {
       // 向工作区子工程复制npmrc文件
      const targetPath = `${e}/.npmrc`
      fs.copyFileSync(sourcePath, targetPath);
      console.log("====== 子工程npmrc文件设置完毕 =======")
    });
    // 替换本工程npmrc文件
    const commonSourcePath = path.join(__dirname, "../.npmrc-child");
    const commonTargetPath = path.join(__dirname, "../.npmrc");
    fs.copyFileSync(commonSourcePath, commonTargetPath);

  })
})

//设置工作区文件
const workspacePath = path.join(__dirname, '../pnpm-workspace.yaml');
fs.readFile(workspacePath, 'utf8', (err, data) => {
  console.log("====== 开始设置工作区 =======")
  const workspacePathArr = getPath.childProPath.map(e => {
    const sourceProPath = getPath.currentPath
    const targetProPath = e
    const childProPath = path.relative(sourceProPath, targetProPath)
    return `  - '${childProPath.replace(/\\/g, '/')}/'`
  })
  const workspacePathStr = workspacePathArr.join('\n')
  const newData = 'packages:\n' + workspacePathStr
  fs.writeFile(workspacePath, newData, 'utf8', function (writeErr) {
    if (writeErr) return console.log(writeErr);
    console.log("====== 工作区设置完毕 =======")
  });
})
