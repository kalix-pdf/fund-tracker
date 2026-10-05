import { ipcMain } from 'electron'
import type { WindowManager } from '../windows/window.manager'

export function registerWindowHandlers(windows: WindowManager): void {
  ipcMain.handle('window:enter-app', (event) => windows.enterApp(event.sender))
  ipcMain.handle('window:enter-login', (event) => windows.enterLogin(event.sender))
}