# data-platform-pnpm-store

## 说明

```
本工程用于pnpm安装打包各工程，支持独立打包也支持批量打包
独立打包时，打包工程会寻找根目录下是否有此工程，没有则创建一个新的该工程，并生成新的仓库
所以请将本工程置于根目录下，否则生成新的仓库会比较耗时
如果不考虑批量打包，在第一个子工程安装本仓库后，后续工程也都会直接使用本仓库
```

## 独力打包子工程时

```
必须复制utils/pnpmInstall.js 文件到需要打包工程的 src/utils/下

并在package.json中添加执行脚本
"pnpm-install": "node src/utils/pnpmInstall.js"

或者直接执行
 node src/utils/pnpmInstall

maven允许请复制本工程的pom-child.xml文件中的内容到目标工程pom中
如需自定义pom 文件 则必须要保留 npm run pnpm-install 模块

pnpm-install脚本存在时
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

pnpm-install脚本不存在时(支持node命令)
         <execution>
            <id>node src/utils/pnpm-install</id>
            <goals>
              <goal>node</goal>
            </goals>
            <phase>generate-resources</phase>
            <configuration>
              <arguments>src/utils/pnpm-install</arguments>
            </configuration>
          </execution>

```

## 同时打包所有子本工程执行本 pom 流程即可

```
本工程会自动收集所有共同标识的子工程，具体在utils/getPath.js文件中配置，如需更改标识请更改以下字段

//排除无需筛选的文件夹,可以排除不需要的工程和因为权限问题产生的无法打开的文件夹
const excludePath = ['$RECYCLE.BIN', 'node_modules', '.pnpm-store', 'System Volume Information', 'data-platform-frontend']

//工程标识，本标识标识文件名中包含此字段
const proFlag = 'data-platform'

//前端工程标识，在proFlag下的文件夹中寻找包含frontendProFlag标识的文件夹且该文件夹中必须包含frontendProFileFlag文件
const frontendProFlag = 'frontend'
const frontendProFileFlag = 'package.json'

例： /**/data-platform-example/frontend-example/package.json  此路径存在时会自动加入子工程

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

## 安装 node 和 npm

## 安装 rimraf

```
npm install rimraf --registry=http://192.168.81.5:8081/repository/npm-all/
```

## 执行清除(清除本项目和子项目所有相关文件/不清除 pnpm 仓库)

```
npm run clean
```

## 安装 pnpm

```
npm install pnpm@5.9.0
```

### 设置子工程 npmrc

```
npm run set-child
```

### 执行子工程 install

```
npm run child-install
```

### 执行子工程 build(也可以放到子工程进行)

```
npm run child-build
```

### 项目结构

```
├── node_modules      # 本工程依赖
├── pnpm            #pnpm仓库
├── utils
│   ├── childBuild.js        # 构建子工程build-copy脚本
│   ├── childInstall.js      # 为子工程执行pnpm安装流程
│   ├── cleanCache.js        # 清除本工程和子工程所有相关文件
│   ├── cleanPackage.js      # 指定删除某个依赖包（半成品，不要用）
│   ├── copyChild.js         # 为所有子工程复制特定文件
│   ├── fileUtil.js          # 公共文件方法
│   └── getPath.js           # 相关路径获取
│   └── loginRepository.js   # 登录私服
│   └── npmPublish.js        # 想私服推送本工程
│   └── pnpmfile.js          # pnpm相关hook
│   └── pnpmInstall.js       # 子工程独立打包流程
│   └── record.js            # 本工程字段缓存
│   └── setChild.js          # 配置子工程部分文件.npmrc/工作区pnpm-workspace.yaml等相关
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
1. 建议使用webstorm(项目内配置自动识别)/vscode
2. 安装nodejs 版本(node-v10.16.3)
3. 升级npm为最新(npm install npm -g)
4. 注册本地npm源(npm config set registry http://192.168.81.5:8081/repository/npm-all/)
4. 私服源(http://192.168.81.5:8081/repository/npm-hossted/)
5. 升级pnpm 为5.9.0版本(npm install pnpm -g)
```

### 工程路径变更时，本工程需视情况同步更改

```
utils/getPath
```
