const { exec } = require('child_process')
const getPath = require('./getPath')

getPath.relativeChildProPath.forEach(e => {
    console.log(`====== 开始打包${e} ======`)
    const cmd = `pnpm recursive exec --filter ${e} npm run build-copy`
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
