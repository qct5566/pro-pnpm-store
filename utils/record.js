
const fs = require('fs')
const path = require('path')

const record = {
  // recordStart
  childProPath: [], // 子工程路径
  config: {
    allConfig: {
      proFlag: {
        pro: 'data-platform',
        frontendPro: 'frontend',
        frontendProFile: 'package.json'
      },
      customBuild: []
    }
  } // 子工程配置
  // recordEnd
}

// record 各项结尾标识
const recordEndFlag = '// 子工程'

const writeRecord = (key, value) => {
  return new Promise((resolve) => {
    const currentPath = path.join(__dirname, '../utils/record.js')
    fs.readFile(currentPath, 'utf8', (err, data) => {
      console.log('err', err)
      const recordObjStartIndex = data.indexOf('// recordStart')
      const recordObjEndIndex = data.indexOf('// recordEnd')
      const recordStr = data.substring(recordObjStartIndex, recordObjEndIndex).replace('// recordStart', '')
      const keyIndex = recordStr.indexOf(key)
      if (keyIndex !== -1) {
        const endStr = recordStr.substring(keyIndex)
        const keyStartIndex = endStr.indexOf(key)
        const keyEndIndex = endStr.indexOf(recordEndFlag)
        const keyStr = endStr.substring(keyStartIndex, keyEndIndex)
        const hasComma = keyStr.trim().endsWith(',')
        let newValue
        console.log(`record.${key}类型`, Object.prototype.toString.call(value))
        switch (Object.prototype.toString.call(value)) {
          case '[object String]':
            newValue = `'${value}'`
            break
          case '[object Null]':
          case '[object Undefined]':
          case '[object Number]':
          case '[object Boolean]':
            newValue = value
            break
          case '[object Array]':
            newValue = `\[${value.map(e => `'${e}'`).join()}\]`
            break
          case '[object Object]':
            newValue = JSON.stringify(value)
            break
          case '[object Function]':
            const valueStr = `'${value}'`
            newValue = valueStr.substring(1, valueStr.length - 1)
            break
        }
        const newKeyValue = `${key}: ${typeof newValue === 'function' ? newValue() : newValue }${hasComma ? ',' : ''}`
        const newData = data.replace(keyStr, newKeyValue)
        fs.writeFile(currentPath, newData, 'utf8', function (err) {
          resolve(record)
          if (err) return console.log(err)
        })
      }
    })
  })
}

module.exports = {
  record,
  writeRecord
}
