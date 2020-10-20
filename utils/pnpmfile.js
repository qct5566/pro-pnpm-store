module.exports = {
    hooks: {
      readPackage (pkg,context) {
        console.log('pkg.name',pkg.name)
        if(pkg.name!=='datadevs-guide-common'){
          // console.log('pkg',pkg,context)
          // 手动为子工程添加缺失的包
          // pkg.dependencies['@babel/'] = '^7.0.0'
        }
        return pkg
      },
    }
  }