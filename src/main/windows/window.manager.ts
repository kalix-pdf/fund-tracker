import { BrowserWindow, screen, shell } from 'electron'
import type { BrowserWindowConstructorOptions, Rectangle, WebContents } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

type AppView = 'login' | 'main'

const BACKGROUND_COLOR = '#ffffff' // keep in sync with the app's root background
const LOGIN_WIDTH = 1000

export function getLoginBounds(workArea: Rectangle): Rectangle {
  const width = Math.min(LOGIN_WIDTH, workArea.width)
  return {
    width,
    height: workArea.height,
    x: workArea.x + Math.round((workArea.width - width) / 2),
    y: workArea.y
  }
}

export class WindowManager {
  private loginWindow: BrowserWindow | null = null
  private mainWindow: BrowserWindow | null = null
  private transition: Promise<void> | null = null

  /** Resolves once the login window is visible. */
  openLogin(): Promise<void> {
    if (this.loginWindow && !this.loginWindow.isDestroyed()) {
      this.loginWindow.focus()
      return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
      const win = this.createWindow({
        ...getLoginBounds(screen.getPrimaryDisplay().workArea),
        resizable: false,
        maximizable: false,
        fullscreenable: false
      })
      this.loginWindow = win

      win.once('ready-to-show', () => {
        win.show()
        resolve()
      })
      win.on('closed', () => {
        this.loginWindow = null
      })

      this.load(win, 'login').catch(reject)
    })
  }

  /** Login -> main. Resolves once main is visible and login is closed. */
  enterApp(sender: WebContents): Promise<void> {
    if (!this.loginWindow || BrowserWindow.fromWebContents(sender) !== this.loginWindow) {
      return Promise.reject(new Error('enterApp may only be called from the login window'))
    }
    this.transition ??= this.openMain().finally(() => {
      this.transition = null
    })
    return this.transition
  }

  /** Main -> login (logout). Resolves once login is visible and main is closed. */
  enterLogin(sender: WebContents): Promise<void> {
    if (!this.mainWindow || BrowserWindow.fromWebContents(sender) !== this.mainWindow) {
      return Promise.reject(new Error('enterLogin may only be called from the main window'))
    }
    this.transition ??= this.openLogin()
      .then(() => this.mainWindow?.close())
      .finally(() => {
        this.transition = null
      })
    return this.transition
  }

  private openMain(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const win = this.createWindow(screen.getPrimaryDisplay().workArea)
      this.mainWindow = win

      win.on('closed', () => {
        this.mainWindow = null
      })

      win.webContents.once('did-fail-load', (_event, code, description) => {
        win.destroy()
        reject(new Error(`Main window failed to load (${code}): ${description}`))
      })

      win.once('ready-to-show', () => {
        win.maximize() // also shows a hidden window
        win.focus()
        this.loginWindow?.close()
        resolve()
      })

      this.load(win, 'main').catch(reject)
    })
  }

  private createWindow(options: BrowserWindowConstructorOptions): BrowserWindow {
    const win = new BrowserWindow({
      ...options,
      show: false,
      backgroundColor: BACKGROUND_COLOR,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    win.webContents.setWindowOpenHandler(({ url }) => {
      void shell.openExternal(url)
      return { action: 'deny' }
    })

    return win
  }

  private load(win: BrowserWindow, view: AppView): Promise<void> {
    const devUrl = process.env['ELECTRON_RENDERER_URL']
    if (is.dev && devUrl) {
      return win.loadURL(`${devUrl}#${view}`)
    }
    return win.loadFile(join(__dirname, '../renderer/index.html'), { hash: view })
  }
}