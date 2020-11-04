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
