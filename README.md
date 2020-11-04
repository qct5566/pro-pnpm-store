# data-platform-pnpm-store

## 说明

```
本工程用于pnpm安装打包各工程，支持独立打包也支持批量打包
独立打包时，打包工程会寻找根目录下是否有此工程，没有则创建一个新的该工程，并生成新的仓库
所以请将本工程置于根目录下，否则生成新的仓库会比较耗时
如果不考虑批量打包，在第一个子工程安装本仓库后，后续工程也都会直接使用本仓库
```

## 打包配置
```
执行打包前,必须复制utils/pnpmInstall.js 文件到需要打包工程的 src/utils/下,
并在package.json中添加执行脚本
"pnpm-install": "node src/utils/pnpmInstall.js"
或者手动执行
node src/utils/pnpmInstall

/*
maven允许请复制本工程的pom-child.xml文件中的内容到目标工程pom中
如需自定义pom 文件 则必须要保留 npm run pnpm-install 模块
*/
  <execution>
    <id>npm run pnpm-install</id>
    <goals>
      <goal>npm</goal>
    </goals>
    <phase>generate-resources</phase>
    <configuration>
      <arguments>run pnpm-install</arguments>
    </configuration>
  </execution>

/**
 * pnpmInstall中的打包相关配置说明,所有配置区分大小写
 */
const config = {
  isAllBuild: false, // 是否将所有相关工程打包,设置为true时，统一使用build中的配置，注意相关工程配置
  allConfig: { // 多工程打包相关配置,只有isAllBuild为true时，才会生效
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
```

## package.json 脚本介绍
```
 "scripts": {
    "serve": "vue-cli-service serve",
    "dev": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "npm-publish": "node utils/loginRepository.js && node utils/npmPublish.js",  //登录并推送本工程，同时版本号加0.0.1
    "clean": "node utils/cleanCache.js",  //清理工程
    "clean-package": "node utils/cleanPackage.js",  //清理仓库包（有bug）
    "copy-child": "node utils/copyChild.js",  //向子工程复制相关文件(手动执行)
    "set-child": "node utils/setChild.js",  //设置子工程相关
    "child-install": "node utils/childInstall",  //执行子工程install流程
    "child-build": "node utils/childBuild"  //执行子工程打包流程 这里使用build-copy
  },
```
### 项目结构

```
├── node_modules      # 本工程依赖
├── pnpm            #pnpm仓库
├── utils
│   ├── childBuild.js        # 执行业务工程build脚本
│   ├── childInstall.js      # 为子业务程执行pnpm安装流程
│   ├── cleanCache.js        # 清除本工程和业务工程所有相关文件
│   ├── cleanPackage.js      # 指定删除某个依赖包（试验，未启用）
│   ├── copyChild.js         # 为所有子工程复制特定文件
│   ├── fileUtil.js          # 公共文件方法
│   └── getPath.js           # 相关路径获取
│   └── loginRepository.js   # 登录私服
│   └── npmPublish.js        # 向私服推送本工程
│   └── pnpmfile.js          # pnpm相关hook
│   └── pnpmInstall.js       # 业务工程流程
│   └── pnpmProcess.js       # 仓库工程流程
│   └── record.js            # 本工程字段缓存
│   └── setChild.js          # 配置子工程部分文件.npmrc/工作区pnpm-workspace.yaml等相关
│   └── skip.js              # 跳过占位
├── .gitignore               # git提交排除
├── .npmrc-child             # 子工程.npmrc文件配置，setChild执行时会生成本工程路径，用于复制给子工程
└── .npmrc                   # pnpm工作区配置文件
└── package.json             # 依赖包和相关命令管理文件
└── pnpm-workspace.yaml      # pnpm工作区范围控制文件
└── pom-child.xml            # 子工程独立构建pom例子，可以直接复制
└── pom.xml                  # 执行本pom即可批量安装打包所有相关子工程
```

### 环境安装

```
1. 建议使用vscode和webstorm(项目内配置自动识别)
2. 安装nodejs 版本(node-v10.16.3)
3. 升级npm为最新(npm install npm -g)
4. 注册本地npm源(npm config set registry http://192.168.81.5:8081/repository/npm-all/)
4. 私服源(http://192.168.81.5:8081/repository/npm-hossted/)
5. 升级pnpm 为5.9.0版本(npm install pnpm -g)
```