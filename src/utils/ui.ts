let loadingCount = 0
let loadingElement = null

export function showLoading(title = '加载中...') {
  loadingCount++
  if (loadingCount === 1) {
    loadingElement = document.createElement('div')
    loadingElement.id = 'global-loading'
    loadingElement.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; z-index: 99999;'
    
    const content = document.createElement('div')
    content.style.cssText = 'background: rgba(0, 0, 0, 0.8); color: white; padding: 20px 30px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 10px;'
    
    const spinner = document.createElement('div')
    spinner.style.cssText = 'width: 30px; height: 30px; border: 3px solid rgba(255, 255, 255, 0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 0.8s linear infinite;'
    
    const text = document.createElement('span')
    text.textContent = title
    
    const style = document.createElement('style')
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'
    
    content.appendChild(spinner)
    content.appendChild(text)
    loadingElement.appendChild(content)
    document.head.appendChild(style)
    document.body.appendChild(loadingElement)
  }
}

export function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1)
  if (loadingCount === 0 && loadingElement) {
    loadingElement.remove()
    loadingElement = null
  }
}

export function showModal(options) {
  const { title, content, showCancel = true, confirmText = '确定', cancelText = '取消', success } = options
  
  const modal = document.createElement('div')
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 99999;'
  
  const modalContent = document.createElement('div')
  modalContent.style.cssText = 'background: white; border-radius: 12px; width: 280px; overflow: hidden; animation: modalIn 0.2s ease-out;'
  
  const style = document.createElement('style')
  style.textContent = '@keyframes modalIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }'
  
  const header = document.createElement('div')
  header.style.cssText = 'padding: 20px 20px 10px; text-align: center; font-size: 17px; font-weight: 600; color: #333;'
  header.textContent = title
  
  const body = document.createElement('div')
  body.style.cssText = 'padding: 0 20px 20px; text-align: center; font-size: 14px; color: #666; line-height: 1.5;'
  body.textContent = content
  
  const buttons = document.createElement('div')
  buttons.style.cssText = 'display: flex; border-top: 1px solid #eee;'
  
  if (showCancel) {
    const cancelBtn = document.createElement('button')
    cancelBtn.style.cssText = 'flex: 1; padding: 14px; border: none; background: white; font-size: 16px; color: #666; cursor: pointer; border-right: 1px solid #eee;'
    cancelBtn.textContent = cancelText
    cancelBtn.onclick = () => {
      modal.remove()
      style.remove()
      success && success({ confirm: false, cancel: true })
    }
    buttons.appendChild(cancelBtn)
  }
  
  const confirmBtn = document.createElement('button')
  confirmBtn.style.cssText = 'flex: 1; padding: 14px; border: none; background: white; font-size: 16px; color: #0066cc; font-weight: 500; cursor: pointer;'
  confirmBtn.textContent = confirmText
  confirmBtn.onclick = () => {
    modal.remove()
    style.remove()
    success && success({ confirm: true, cancel: false })
  }
  buttons.appendChild(confirmBtn)
  
  modalContent.appendChild(header)
  modalContent.appendChild(body)
  modalContent.appendChild(buttons)
  modal.appendChild(modalContent)
  
  document.head.appendChild(style)
  document.body.appendChild(modal)
}
