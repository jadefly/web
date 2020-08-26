// 下载文件统一url，id作为唯一标识
function download(id) {
  // let downloadWidnow = window.open()
  // downloadWidnow.location.href = process.env.VUE_APP_BASE_API + '/upload/getFile?id=' + id
  const link = document.createElement('a')
  const body = document.querySelector('body')

  link.href = process.env.VUE_APP_BASE_API + '/upload/getFile?id=' + id
  link.download = '导出文件'

  // fix Firefox
  link.style.display = 'none'
  body.appendChild(link)

  link.click()
  body.removeChild(link)
}

const configurl = {
  download
}
export default configurl
