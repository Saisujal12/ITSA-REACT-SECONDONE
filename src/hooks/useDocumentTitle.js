import { useEffect } from 'react'
import { pageTitle } from '../data/site'

/** Sets the document title in the "Page | IT Department KITSW" format. */
export function useDocumentTitle(page, { raw = false } = {}) {
  useEffect(() => {
    document.title = raw ? page : pageTitle(page)
  }, [page, raw])
}
