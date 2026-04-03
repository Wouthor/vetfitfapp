import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!privateKey) throw new Error('GOOGLE_PRIVATE_KEY is not set')

  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
}

export async function listDocxFilesRecursive(folderId: string): Promise<DriveFile[]> {
  const auth = getAuthClient()
  const drive = google.drive({ version: 'v3', auth })

  const results: DriveFile[] = []

  async function scanFolder(id: string) {
    let pageToken: string | undefined

    do {
      const response = await drive.files.list({
        q: `'${id}' in parents and trashed = false`,
        fields: 'nextPageToken, files(id, name, mimeType)',
        pageSize: 1000,
        pageToken,
      })

      const files = response.data.files ?? []

      for (const file of files) {
        if (!file.id || !file.name) continue

        if (file.mimeType === 'application/vnd.google-apps.folder') {
          await scanFolder(file.id)
        } else if (
          file.name.endsWith('.docx') ||
          file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.mimeType === 'application/vnd.google-apps.document'
        ) {
          results.push({ id: file.id, name: file.name, mimeType: file.mimeType ?? '' })
        }
      }

      pageToken = response.data.nextPageToken ?? undefined
    } while (pageToken)
  }

  await scanFolder(folderId)
  return results
}

export async function exportGoogleDocAsText(fileId: string): Promise<string> {
  const auth = getAuthClient()
  const drive = google.drive({ version: 'v3', auth })

  const response = await drive.files.export(
    { fileId, mimeType: 'text/plain' },
    { responseType: 'text' }
  )

  return response.data as string
}

export async function downloadFileAsBuffer(fileId: string): Promise<Buffer> {
  const auth = getAuthClient()
  const drive = google.drive({ version: 'v3', auth })

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  )

  return Buffer.from(response.data as ArrayBuffer)
}
