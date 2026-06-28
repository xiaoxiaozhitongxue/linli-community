let loadingCount = 0
let loadingElement = null

export function showLoading(title = '加载中...') {
  loadingCount++
  if (loadingCount === 1) {
    loadingElement = document.createElement('div')
    loadingElement.id = 'global-loading'
    loadingElement.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--color-bg-overlay); display: flex; align-items: center; justify-content: center; z-index: 99999;'
    
    const content = document.createElement('div')
    content.style.cssText = 'background: var(--toast-bg); color: var(--color-text-white); padding: 20px 30px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; gap: 10px;'
    
    const spinner = document.createElement('div')
    spinner.style.cssText = 'width: 30px; height: 30px; border: 3px solid rgba(255, 255, 255, 0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 0.8s linear infinite;'
    
    const text = document.createElement('span')
    text.textContent = title
    
    content.appendChild(spinner)
    content.appendChild(text)
    loadingElement.appendChild(content)
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
  modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--color-bg-overlay); display: flex; align-items: center; justify-content: center; z-index: 99999;'
  
  const modalContent = document.createElement('div')
  modalContent.style.cssText = 'background: var(--color-bg-secondary); border-radius: 12px; width: 280px; overflow: hidden; animation: scaleIn 0.2s ease-out;'
  
  const header = document.createElement('div')
  header.style.cssText = 'padding: 20px 20px 10px; text-align: center; font-size: 17px; font-weight: 600; color: var(--color-text-primary);'
  header.textContent = title
  
  const body = document.createElement('div')
  body.style.cssText = 'padding: 0 20px 20px; text-align: center; font-size: 14px; color: var(--color-text-secondary); line-height: 1.5;'
  body.textContent = content
  
  const buttons = document.createElement('div')
  buttons.style.cssText = 'display: flex; border-top: 1px solid var(--color-border-light);'
  
  if (showCancel) {
    const cancelBtn = document.createElement('button')
    cancelBtn.style.cssText = 'flex: 1; padding: 14px; border: none; background: var(--color-bg-secondary); font-size: 16px; color: var(--color-text-secondary); cursor: pointer; border-right: 1px solid var(--color-border-light);'
    cancelBtn.textContent = cancelText
    cancelBtn.onclick = () => {
      modal.remove()
      success && success({ confirm: false, cancel: true })
    }
    buttons.appendChild(cancelBtn)
  }
  
  const confirmBtn = document.createElement('button')
  confirmBtn.style.cssText = 'flex: 1; padding: 14px; border: none; background: var(--color-bg-secondary); font-size: 16px; color: var(--color-info); font-weight: 500; cursor: pointer;'
  confirmBtn.textContent = confirmText
  confirmBtn.onclick = () => {
    modal.remove()
    success && success({ confirm: true, cancel: false })
  }
  buttons.appendChild(confirmBtn)
  
  modalContent.appendChild(header)
  modalContent.appendChild(body)
  modalContent.appendChild(buttons)
  modal.appendChild(modalContent)
  
  document.body.appendChild(modal)
}
