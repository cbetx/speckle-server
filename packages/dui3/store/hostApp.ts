import {
  DocumentInfo,
  DocumentModelStore,
  IModelCard,
  ISenderModelCard,
  IReceiverModelCard
} from 'lib/bindings/definitions/IBasicConnectorBinding'
import { ISendFilter } from 'lib/bindings/definitions/ISendBinding'
// import { CommitCreateInput } from '~/lib/common/generated/gql/graphql'
// import { useCreateCommit, useGetModelDetails } from '~/lib/graphql/composables'
// import { useAccountStore } from '~/store/accounts'

export type ProjectModelGroup = {
  projectId: string
  accountId: string
  senders: ISenderModelCard[]
  receivers: IReceiverModelCard[]
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const useHostAppStore = defineStore('hostAppStore', () => {
  const app = useNuxtApp()
  // const accountStore = useAccountStore()

  const documentInfo = ref<DocumentInfo>()
  const documentModelStore = ref<DocumentModelStore>({ models: [] })
  const projectModelGroups = computed(() => {
    const projectModelGroups: ProjectModelGroup[] = []

    for (const model of documentModelStore.value.models) {
      let project = projectModelGroups.find((p) => p.projectId === model.projectId)
      if (!project) {
        project = {
          projectId: model.projectId,
          accountId: model.accountId,
          senders: [],
          receivers: []
        }
        projectModelGroups.push(project)
      }
      if (model.typeDiscriminator.toLowerCase().includes('sender'))
        project.senders.push(model as ISenderModelCard)
      if (model.typeDiscriminator.toLowerCase().includes('receiver'))
        project.receivers.push(model as IReceiverModelCard)
    }

    return projectModelGroups
  })

  const sendFilters = ref<ISendFilter[]>()
  const selectionFilter = computed(() =>
    sendFilters.value?.find((f) => f.name === 'Selection')
  )

  const everythingFilter = computed(() =>
    sendFilters.value?.find((f) => f.name === 'Everything')
  )

  const addModel = async (model: IModelCard) => {
    await app.$baseBinding.addModel(model)
    documentModelStore.value.models.push(model)
  }

  const updateModelFilter = async (modelId: string, filter: ISendFilter) => {
    const modelIndex = documentModelStore.value.models.findIndex(
      (m) => m.id === modelId
    )
    const model = documentModelStore.value.models[modelIndex] as ISenderModelCard
    model.sendFilter = filter

    await app.$baseBinding.updateModel(documentModelStore.value.models[modelIndex])
  }

  const refreshDocumentInfo = async () =>
    (documentInfo.value = await app.$baseBinding.getDocumentInfo())

  const refreshDocumentModelStore = async () =>
    (documentModelStore.value = await app.$baseBinding.getDocumentState())

  const refreshSendFilters = async () =>
    (sendFilters.value = await app.$sendBinding?.getSendFilters())

  app.$baseBinding.on(
    'documentChanged',
    () =>
      setTimeout(() => {
        void refreshDocumentInfo()
        void refreshDocumentModelStore()
        void refreshSendFilters()
      }, 500) // timeout exists because of rhino
  )

  app.$sendBinding?.on('filtersNeedRefresh', () => void refreshSendFilters())

  app.$sendBinding?.on('sendersExpired', (senderIds) => {
    documentModelStore.value.models
      .filter((m) => senderIds.includes(m.id))
      .forEach((model) => ((model as ISenderModelCard).expired = true))
  })

  // app.$sendBinding?.on('senderProgress', (args) )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.$sendBinding.on('createVersion', (args) => {
    // TODO: Dim
    // - implement  serever bound create model version api
    // - use that
  })

  // First initialization calls
  void refreshDocumentInfo()
  void refreshDocumentModelStore()
  void refreshSendFilters()

  return {
    documentInfo,
    projectModelGroups,
    sendFilters,
    selectionFilter,
    everythingFilter,
    addModel,
    updateModelFilter,
    refreshSendFilters
  }
})