const path = require("path");
const fs = require("fs");
const { record, writeRecord } = require('./record');

const { config } = record

// const dirName = __dirname.split('\\')

const root = config.root

//当前工程名称
const currentProName = path.basename(path.join(__dirname, '..'));

// 当前工程路径
const currentPath = path.join(__dirname, '..');

//排除无需筛选的文件夹,可以排除不需要的工程和因为权限问题产生的无法打开的文件夹
const excludePath = ['$RECYCLE.BIN', 'node_modules', '.pnpm-store', 'System Volume Information']

//工程标识，本标识标识文件名中包含此字段
const allConfig = config.allConfig || {}

const proFlag = allConfig.proFlag.pro

//前端工程标识，在proFlag下的文件夹中寻找包含frontendProFlag标识的文件夹且该文件夹中必须包含frontendProFileFlag文件
const frontendProFlag = allConfig.proFlag.frontendPro
const frontendProFileFlag = allConfig.proFlag.frontendProFile


const getAllDir = (dirPath) => {
  let dirPathArr = [];
  //获取路径下的所有文件名
  const files = fs.readdirSync(dirPath);
  //获取其中带data-platform的文件
  const childProDirArr = files
    .filter(e => e.indexOf(proFlag) !== -1 && e !== currentProName)
  if (childProDirArr && childProDirArr.length) {
    //data-platform文件存在时，获取该路径下的frontend文件夹，并判断是否是前端工程
    let childProFrontendDirArr = []
    childProDirArr.forEach(childPro => {
      const childProAllPath = path.join(dirPath, childPro)
      //判断是否是目录的文件名
      const childProStat = fs.statSync(childProAllPath)
      const childProIsDir = childProStat.isDirectory()
      const childProFiles = childProIsDir ? fs.readdirSync(childProAllPath) : []
      //筛选符合规则的前端工程目录
      const frontendDir = childProFiles.filter(e => e.indexOf(frontendProFlag) !== -1)
      const realFrontendDir = frontendDir.filter(e => {
        //判断是否是目录的文件名
        const frontendDirfilesPath = path.join(childProAllPath, e)
        const frontendDirfilesStat = fs.statSync(frontendDirfilesPath)
        const frontendDirfilesIsDir = frontendDirfilesStat.isDirectory()
        const frontendDirfiles = frontendDirfilesIsDir ? fs.readdirSync(frontendDirfilesPath) : []
        //判断文件中是否存在前端工程文件标识-frontendProFileFlag
        return frontendDirfiles.includes(frontendProFileFlag)
      }).map(e => path.join(childProAllPath, e))
      childProFrontendDirArr = [...childProFrontendDirArr, ...realFrontendDir]
    })
    dirPathArr = [...dirPathArr, ...childProFrontendDirArr];

  }
  //继续递归查找
  files.filter(e => !excludePath.includes(e)).forEach(e => {
    const fPath = path.join(dirPath, e)
    const stat = fs.statSync(fPath)
    const isDir = stat.isDirectory()
    if (isDir) {
      dirPathArr = [...dirPathArr, ...getAllDir(fPath)];
    }
  })
  return dirPathArr;
};

const startTime = new Date()
console.log('获取业务工程路径中请等待')
let childProPath = record.childProPath && record.childProPath.length ? record.childProPath : getAllDir(root)

if(childProPath && childProPath.length){
  childProPath = childProPath.map(e=>e.replace(/\\/g,'/'))
}

if (!record.childProPath || !record.childProPath.length) {
  writeRecord('childProPath', childProPath)
}

console.log("获取到的业务工程路径", childProPath)
console.log(`获取业务工程路径成功,耗时${startTime - new Date()}`)

//获取相对路径
const relativeChildProPath = childProPath.map(e => path.relative(currentPath, e).replace(/\\/g, '/'))

module.exports = {
  root,
  currentProName,
  currentPath,
  childProPath,
  relativeChildProPath,
} 