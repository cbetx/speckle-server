import { computed } from 'vue'
import { useRouteHashState } from '~~/lib/common/composables/url'

export type EmbedOptions = {
  isTransparent?: boolean
  hideControls?: boolean
  hideSelectionInfo?: boolean
  noScroll?: boolean
  autoload?: boolean
}

export function isEmbedOptions(obj: unknown): obj is EmbedOptions {
  if (typeof obj === 'object' && obj !== null) {
    const possibleOptions = obj as Partial<Record<keyof EmbedOptions, unknown>>
    return (
      [
        'isTransparent',
        'hideControls',
        'hideSelectionInfo',
        'noScroll',
        'autoload'
      ] as Array<keyof EmbedOptions>
    ).every((key) => {
      return !(key in possibleOptions) || typeof possibleOptions[key] === 'boolean'
    })
  }
  return false
}

export function useEmbedState() {
  const { hashState } = useRouteHashState()

  const embedOptions = computed((): EmbedOptions => {
    const embedString = hashState.value.embed
    if (!embedString) return {}

    try {
      const parsed: unknown = JSON.parse(embedString)
      if (isEmbedOptions(parsed)) {
        return parsed
      }
      console.error('Parsed object is not of type EmbedOptions')
    } catch (error) {
      console.error('Error parsing embed options from URL:', error)
    }
    return {}
  })

  return {
    embedOptions
  }
}
