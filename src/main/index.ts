import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { openDb } from './db/client'
import { RequestRepository } from './repositories/request.repository'
import { RequestService } from './services/request.service'
import { registerRequestHandlers } from './ipc/request.handlers'
import { registerWindowHandlers } from './ipc/window.handlers'
import { WindowManager } from './windows/window.manager'

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.totops.fund-tracker.app')

  const { db } = openDb()
  const repo = new RequestRepository(db)
  const windows = new WindowManager()

  registerRequestHandlers(repo, new RequestService(repo))
  registerWindowHandlers(windows)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  void windows.openLogin()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void windows.openLogin()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})