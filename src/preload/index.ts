import { contextBridge, ipcRenderer  } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'
import type { CreateRequestInput, ListQuery } from '../shared/schema'

// Custom APIs for renderer
const api = {
  requests: {
    list: (q?: ListQuery) => ipcRenderer.invoke('requests:list', q),
    create: (input: CreateRequestInput) => ipcRenderer.invoke('requests:create', input),
    advance: (id: number, to: 'APPROVED' | 'RELEASED') =>
      ipcRenderer.invoke('requests:advance', { id, to }),
    complete: (id: number, liquidatedCentavos: number) =>
      ipcRenderer.invoke('requests:complete', { id, liquidatedCentavos }),
    markReimbursed: (id: number) => ipcRenderer.invoke('requests:markReimbursed', id),
    markRefunded: (id: number) => ipcRenderer.invoke('requests:markRefunded', id),
    dashboardSummary: () => ipcRenderer.invoke('requests:dashboardSummary'),
  }
}

contextBridge.exposeInMainWorld('api', api)
export type Api = typeof api

// // Use `contextBridge` APIs to expose Electron APIs to
// // renderer only if context isolation is enabled, otherwise
// // just add to the DOM global.
// if (process.contextIsolated) {
//   try {
//     contextBridge.exposeInMainWorld('electron', electronAPI)
//     contextBridge.exposeInMainWorld('api', api)
//   } catch (error) {
//     console.error(error)
//   }
// } else {
//   // @ts-ignore (define in dts)
//   window.electron = electronAPI
//   // @ts-ignore (define in dts)
//   window.api = api
// }
