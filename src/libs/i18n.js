import i18n from 'i18n'
import path from 'path'

i18n.configure({
  locales: ['en-US', 'ja-JP', 'fr-FR'],
  defaultLocale: 'en-US',
  syncFiles: true,
  autoReload: true,
  directory: path.join(__dirname, '../locals')
})

export default i18n
