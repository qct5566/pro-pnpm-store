/**
 * 用于登录npm私服
 */
const { spawn } = require('child_process')

console.log('===========================开始调用登录==============================')

const registry = 'http://192.168.81.5:8081/repository/npm-hossted/' // 私服地址
const username = 'linewell' // 登录私服用户名
const password = 'linewell' // 登录私服密码
const email = 'bigdata@linewell.com' // 邮箱

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['login', '--registry=' + registry])
child.stdout.on('data', function (data) {
  console.log('=====================' + data + '=====================')
  if (data.toString() === 'Username: ') {
    console.log(data + 'linewell')
    child.stdin.write(Buffer.from(username + '\r'))
  }
  if (data.toString() === 'Password: ') {
    console.log(data + 'linewell')
    child.stdin.write(Buffer.from(password + '\r'))
  }
  if (data.toString() === 'Email: (this IS public) ') {
    console.log(data + 'bigdata@linewell.com')
    child.stdin.write(Buffer.from(email + '\r'))
  }
  if (data.toString().indexOf('Logged') !== -1) {
    console.log(data)
  }
})
child.stderr.on('data', function (data) {
  console.log('执行异常' + data)
})

// const execxx = spawn('bash')
// execxx.stdin.end(`rm -rf /home/repositories/maven/node`)
// 生成全局访问
// console.log('系统' + process.platform)
// process.env.PATH += '/home/repositories/maven/node/node_modules/npm/bin:'
// if (process.platform === 'linux') {
//   const link = exec('npm config ls')
//   link.stdout.on('data', function (data) {
//     console.log('执行' + data)
//   })
//   link.stderr.on('data', function (data) {
//     console.log('执行异常' + data)
//   })
// }

// const child = spawn('bash')
// child.stdin.end(`chmod -R 777 /home/repositories/maven/node && npm config ls`)
// child.stdin.end(`rm -rf /usr/local/bin/node && rm -rf /usr/local/bin/npm`)
// child.stdin.end(`npm config ls`)
// child.stdout.on('data', function (data) {
//   console.log('=====================' + data + '=====================')
//   if (data.toString() === 'Username: ') {
//     console.log(data + 'linewell')
//     child.stdin.write(Buffer.from('linewell\r'))
//   }
//   if (data.toString() === 'Password: ') {
//     console.log(data + 'linewell')
//     child.stdin.write(Buffer.from('linewell\r'))
//   }
//   if (data.toString() === 'Email: (this IS public) ') {
//     console.log(data + 'bigdata@linewell.com')
//     child.stdin.write(Buffer.from('bigdata@linewell.com\r'))
//   }
//   if (data.toString().indexOf('Logged') !== -1) {
//     console.log(data)
//   }
// })
// child.stderr.on('data', function (data) {
//   console.log('执行异常' + data)
// })
