import { MaybeRef } from '@vueuse/core'
import { Nullable, Optional } from '@speckle/shared'
import { BaseError } from '~~/lib/core/errors/base'
import {
  FileTypeSpecifier,
  generateFileId,
  isFileTypeSpecifier,
  prettyFileSize,
  validateFileType
} from '~~/lib/core/helpers/file'
import { BlobPostResultItem } from '~~/lib/core/api/blobStorage'

/**
 * A file, as emitted out from FileUploadZone
 */
export interface UploadableFileItem {
  file: File
  error: Nullable<Error>
  /**
   * You can use this ID to check for File equality
   */
  id: string
}

/**
 * A file once it's upload has started
 */
export interface UploadFileItem extends UploadableFileItem {
  /**
   * Progress between 0 and 100
   */
  progress: number

  /**
   * When upload has finished this contains a BlobPostResultItem
   */
  result: Optional<BlobPostResultItem>

  /**
   * When a blob gets assigned to a resource, it should count as in use, and this will
   * prevent it from being deleted as junk
   */
  inUse?: boolean
}

function buildFileTypeSpecifiers(
  accept: Optional<string>
): Optional<FileTypeSpecifier[]> {
  if (!accept) return undefined
  const specifiers = accept
    .split(',')
    .map((s) => (isFileTypeSpecifier(s) ? s : null))
    .filter((s): s is FileTypeSpecifier => s !== null)

  return specifiers.length ? specifiers : undefined
}

export function usePrepareUploadableFiles(params: {
  disabled?: MaybeRef<Optional<boolean>>
  accept?: MaybeRef<Optional<string>>
  multiple?: MaybeRef<Optional<boolean>>
  countLimit?: MaybeRef<Optional<number>>
  sizeLimit: MaybeRef<number>
}) {
  const { disabled, accept, multiple, sizeLimit, countLimit } = params

  const fileTypeSpecifiers = computed(() => buildFileTypeSpecifiers(unref(accept)))

  const handleFiles = (files: File[]): UploadableFileItem[] => {
    const results: UploadableFileItem[] = []
    const allowedTypes = fileTypeSpecifiers.value

    for (const file of files) {
      const id = generateFileId(file)
      const finalCountLimit = !unref(multiple) ? 1 : unref(countLimit)

      // skip file, if it's selected twice somehow
      if (results.find((r) => r.id === id)) continue

      // Only allow a single file if !multiple
      if (finalCountLimit && results.length >= finalCountLimit) {
        break
      }

      if (allowedTypes) {
        const validationResult = validateFileType(file, allowedTypes)
        if (validationResult instanceof Error) {
          results.push({
            file,
            id,
            error: validationResult
          })
          continue
        }
      }

      if (file.size > unref(sizeLimit)) {
        results.push({
          file,
          id,
          error: new FileTooLargeError(
            `The selected file's size (${prettyFileSize(
              file.size
            )}) is too big (over ${prettyFileSize(unref(sizeLimit))})`
          )
        })
        continue
      }

      results.push({ file, id, error: null })
    }

    return results
  }

  return {
    /**
     * Validate incoming files and build UploadableFileItem structs out of them
     */
    buildUploadableFiles: (files: File[]) => {
      if (unref(disabled || false)) return
      return handleFiles(files)
    }
  }
}

class FileTooLargeError extends BaseError {
  static defaultMessage = "The selected file's size is too large"
}