import type { Node } from '@nextcloud/files'

import { Uploader } from './uploader'
import UploadPicker from './components/UploadPicker.vue'

export type { Uploader } from './uploader'
export { Status as UploaderStatus } from './uploader'
export { Upload, Status as UploadStatus } from './upload'

let _uploader: Uploader | null = null

export type ConflictResolutionResult = {
	selected: (File|Node)[],
	renamed: (File|Node)[],
}
/**
 * Get an Uploader instance
 */
export function getUploader(): Uploader {
	const isPublic = document.querySelector('input[name="isPublic"][value="1"]') !== null

	if (_uploader instanceof Uploader) {
		return _uploader
	}

	// Init uploader
	_uploader = new Uploader(isPublic)
	return _uploader
}

/**
 * Upload a file
 * This will init an Uploader instance if none exists.
 * You will be able to retrieve it with `getUploader`
 *
 * @param {string} destinationPath the destination path
 * @param {File} file the file to upload
 * @return {Uploader} the uploader instance
 */
export function upload(destinationPath: string, file: File): Uploader {
	// Init uploader and start uploading
	const uploader = getUploader()
	uploader.upload(destinationPath, file)

	return uploader
}

/**
 * Open the conflict resolver
 * @param {string} dirname the directory name
 * @param {(File|Node)[]} conflicts the incoming files
 * @param {Node[]} content all the existing files in the directory
 * @return {Promise<ConflictResolutionResult>} the selected and renamed files
 */
export async function openConflictPicker(dirname: string, conflicts: (File|Node)[], content: Node[]): Promise<ConflictResolutionResult> {
	const { default: ConflictPicker } = await import('./components/ConflictPicker.vue')
	return new Promise((resolve, reject) => {
		const picker = new ConflictPicker({
			propsData: {
				dirname,
				conflicts,
				content,
			},
		})

		// Add listeners
		picker.$on('submit', (results: ConflictResolutionResult) => {
			// Return the results
			resolve(results)

			// Destroy the component
			picker.$destroy()
			picker.$el?.parentNode?.removeChild(picker.$el)
		})
		picker.$on('cancel', (error?: Error) => {
			reject(error ?? new Error('Canceled'))

			// Destroy the component
			picker.$destroy()
			picker.$el?.parentNode?.removeChild(picker.$el)
		})

		// Mount the component
		picker.$mount()
		document.body.appendChild(picker.$el)
	})
}

/**
 * Check if there is a conflict between two sets of files
 * @param {(File|Node)[]} files the incoming files
 * @param {Node[]} content all the existing files in the directory
 * @return {boolean} true if there is a conflict
 */
export function hasConflict(files: (File|Node)[], content: Node[]): boolean {
	const contentNames = content.map((node: Node) => node.basename)
	const conflicts = files.filter((node: File|Node) => {
		const name = (node instanceof File) ? node.name : node.basename
		return contentNames.indexOf(name) !== -1
	}) as Node[]

	return conflicts.length > 0
}

/** UploadPicker vue component */
export { UploadPicker }
