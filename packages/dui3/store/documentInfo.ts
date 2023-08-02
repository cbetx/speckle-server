import { DocumentInfo } from 'lib/data/document/DocumentInfo'
import { defineStore } from 'pinia'

export const useDocumentInfoStore = defineStore('documentInfoStore', () => {
  const app = useNuxtApp()
  const documentInfo = ref<DocumentInfo>()

  app.$baseBinding.on('documentChanged', () => {
    console.log('doc changed')
    setTimeout(async () => {
      const docInfo = await app.$baseBinding.getDocumentInfo()
      documentInfo.value = docInfo
    }, 500) // Rhino needs some time.
  })

  const initDocInfo = async () => {
    documentInfo.value = await app.$baseBinding.getDocumentInfo()
  }

  void initDocInfo()

  return { documentInfo }
})
