const fs = require('fs')
const path = require('path')

//获取某文件夹下所有相关文件
const getAllChildPath = (targetPath, name) => {
  let childPathArr = []
  //判断该路径是否存在并且是目录类型
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    const childrenPath = fs.readdirSync(targetPath)
    childrenPath.forEach(childPath => {
      const childFullPath = path.join(targetPath, childPath)
      if (childPath.indexOf(name) !== -1) {
        childPathArr.push(childFullPath)
      } else {
        childPathArr = [...childPathArr, ...getAllChildPath(childFullPath, name)]
      }
    })
  }
  return childPathArr
}

function deleteFolder(path) {
  var files = []
  if (fs.existsSync(path)) {
    if (fs.statSync(path).isDirectory()) {
      files = fs.readdirSync(path)
      files.forEach(function (file, index) {
        var curPath = path + '/' + file
        if (fs.statSync(curPath).isDirectory()) {
          deleteFolder(curPath)
        } else {
          fs.unlinkSync(curPath)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.unlinkSync(path)
    }
  }
}

function deleteFolderByRimRaf(path, callback) {
  var rimraf = require('rimraf')
  rimraf(path, function (err) {
    if (err) {
      console.log(err)
    } else {
      callback()
    }
  })
}

function deleteFile(path) {
  if (fs.existsSync(path)) {
    if (fs.statSync(path).isDirectory()) {
      deleteFolder(path)
    } else {
      fs.unlinkSync(path)
    }
  }
}

function copyFolder(from, to) { // 复制文件夹到指定目录
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
module.exports = {
  getAllChildPath,
  deleteFile,
  deleteFolder,
  deleteFolderByRimRaf,
  copyFolder
}
