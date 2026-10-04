import { useEffect, useRef } from 'react'

/** How close to the bottom (px) still counts as "at the bottom". */
const SLACK = 80

/**
 * Keeps a scroll container pinned to the bottom as its content grows
 * (new messages, streaming text, images loading), unless the user has
 * scrolled up to read something. Scrolling back down re-pins it.
 */
export function useStickToBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let pinned = true

    const toBottom = () => {
      if (pinned) el.scrollTop = el.scrollHeight
    }
    const onScroll = () => {
      pinned = el.scrollHeight - el.scrollTop - el.clientHeight < SLACK
    }

    const observer = new MutationObserver(toBottom)
    observer.observe(el, { childList: true, subtree: true, characterData: true })
    el.addEventListener('scroll', onScroll, { passive: true })
    // Images (fridge photo, recipe cards) grow the content after they load.
    el.addEventListener('load', toBottom, true)
    toBottom()

    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('load', toBottom, true)
    }
  }, [])

  return ref
}
