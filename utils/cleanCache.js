const fileUtil = require("./fileUtil");
const getPath = require("./getPath");
const { writeRecord } = require('./record')

const folder = [
  {
    path: "dist",
    name: "dist",
    child: true,
  },
  {
    path: ".pnpm-store",
    name: ".pnpm-store",
    child: true,
  },
  {
    path: "npm-shrinkwrap.json",
    name: "npm-shrinkwrap.json",
    child: true,
  },
  {
    path: "node_modules",
    name: "node_modules",
    child: true,
  },
  {
    path: "pnpm-lock.yaml",
    name: "pnpm-lock.yaml",
    child: true,
  },
  {
    path: "package-lock.json",
    name: "package-lock.json",
    child: true,
  },
  {
    path: `.npmrc`,
    name: ".npmrc",
    child: true,
  },
];

const deleteFolder = (path, name) => {
  const startDate = new Date();
  console.log(`开始删除${name}，请等待......`);
  fileUtil.deleteFolderByRimRaf(path, () => {
    const endDate = new Date();
    console.log(`删除${name}成功!! 已用时${endDate - startDate}ms`);
  });
};

const beginDelete = () => {
  const item = (file, project) => {
    const path = `${project}/${file.path}`;
    const name = file.name;
    return {
      path: path,
      name: name,
    };
  };

  //删除仓库工程的pnpm仓库中的lock
  deleteFolder(`${getPath.currentPath}/pnpm/node_modules/.pnpm/lock.yaml`,`公共pnpm仓库中的lock.yaml`)

  folder.forEach((file) => {
    //删除公共工程相关
    const excludesCommon = ['.npmrc', 'node_modules'] // ['.npmrc','.pnpm-store']
    if (!excludesCommon.includes(file.path)) {
      const currentobj = item(file, getPath.currentPath);
      deleteFolder(currentobj.path, `公共${currentobj.name}`);
    }
    //删除子工程相关
    getPath.childProPath.forEach((project) => {
      const obj = item(file, project);
      deleteFolder(obj.path, `子工程${obj.name}`);
    });
  });

  //清空子工程路径标识
  writeRecord('childProPath', [])
};

beginDelete();

