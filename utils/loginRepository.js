/**
 * 用于登录npm私服
 */
const { spawn } = require('child_process')

console.log('===========================开始调用登录==============================')

const registry = 'http://192.168.81.5:8081/repository/npm-hossted/' // 私服地址
const username = '' // 登录私服用户名
const password = '' // 登录私服密码
const email = 'xxxxxxxxxx@.com' // 邮箱

const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['login', '--registry=' + registry])
child.stdout.on('data', function (data) {
  console.log('=====================' + data + '=====================')
  if (data.toString() === 'Username: ') {
    console.log(data + 'xxx')
    child.stdin.write(Buffer.from(username + '\r'))
  }
  if (data.toString() === 'Password: ') {
    console.log(data + 'xxxxx')
    child.stdin.write(Buffer.from(password + '\r'))
  }
  if (data.toString() === 'Email: (this IS public) ') {
    console.log(data + 'xxxxxxxxxx@.com')
    child.stdin.write(Buffer.from(email + '\r'))
  }
  if (data.toString().indexOf('Logged') !== -1) {
    console.log(data)
  }
})
child.stderr.on('data', function (data) {
  console.log('执行异常' + data)
})
