/**
 * Regex to match Bluesky post URLs
 * Matches: https://bsky.app/profile/[handle]/post/[postId]
 */
export const BLUESKY_REGEX = /^https:\/\/bsky\.app\/profile\/([\w.]+)\/post\/([\w]+)(\?.*)?$/
export const BLUESKY_REGEX_GLOBAL = /^https:\/\/bsky\.app\/profile\/([\w.]+)\/post\/([\w]+)(\?.*)?$/g

/**
 * Validates if a URL is a valid Bluesky profile post URL
 * @param url - The URL to validate
 * @returns true if the URL is valid, false otherwise
 */
export const isValidBlueskeyUrl = (url: string): boolean => {
  return BLUESKY_REGEX.test(url)
}

export interface BlueskeyEmbedData {
  /**
   * The AT Protocol URI (at://)
   * Used as data-bluesky-uri attribute
   */
  uri: string

  /**
   * The content ID
   * Used as data-bluesky-cid attribute
   */
  cid: string

  /**
   * The handle of the profile
   * Extracted from the URL
   */
  profileHandle: string

  /**
   * The post ID
   * Extracted from the URL
   */
  postId: string
}

/**
 * Extracts Bluesky embed data from a profile post URL
 * Note: The uri and cid need to be fetched from the Bluesky API or extracted from metadata
 * For now, we return placeholder values that will need to be populated via API
 *
 * @param url - The Bluesky profile post URL
 * @returns The extracted data or null if invalid
 *
 * @example
 * ```ts
 * const data = extractBlueskeyDataFromUrl('https://bsky.app/profile/user/post/123')
 * // Returns: { uri: 'at://...', cid: 'bafy...', profileHandle: 'user', postId: '123' }
 * ```
 */
export const extractBlueskeyDataFromUrl = (url: string): BlueskeyEmbedData | null => {
  if (!isValidBlueskeyUrl(url)) {
    return null
  }

  const match = url.match(BLUESKY_REGEX)

  if (!match || !match[1] || !match[2]) {
    return null
  }

  const profileHandle = match[1]
  const postId = match[2]

  /**
   * NOTE: The uri and cid should ideally be fetched from the Bluesky API or
   * extracted from the page metadata. For now, we provide placeholder values.
   *
   * To get actual values, you would need to:
   * 1. Call the Bluesky API to resolve the profile and post
   * 2. Or fetch the URL and parse the Open Graph meta tags
   *
   * The format is:
   * - uri: at://did:plc:[user-id]/app.bsky.feed.post/[post-id-in-base32]
   * - cid: bafy[...]
   */
  return {
    uri: `at://did:plc:unknown/app.bsky.feed.post/${postId}`,
    cid: 'bafyunknown',
    profileHandle,
    postId,
  }
}

/**
 * Note: This function is currently a placeholder.
 * It returns the input URL as-is since Bluesky embeds render via the embed.js script
 * and don't require transformation like YouTube or Twitch embeds.
 */
export const getEmbedUrlFromBlueskeyUrl = (url: string): string | null => {
  if (!isValidBlueskeyUrl(url)) {
    return null
  }

  return url
}

/**
 * Loads the Bluesky embed script globally
 * This script is required to render Bluesky embeds on the page
 *
 * Should be called once at mount time using a singleton pattern
 * @example
 * ```ts
 * loadBlueskeyEmbedScript()
 * ```
 */
export const loadBlueskeyEmbedScript = (): void => {
  // Check if script is already loaded
  if (document.querySelector('script[src="https://embed.bsky.app/static/embed.js"]')) {
    return
  }

  const script = document.createElement('script')
  script.src = 'https://embed.bsky.app/static/embed.js'
  script.async = true
  script.charset = 'utf-8'

  // Append to document head
  document.head.appendChild(script)
}

/**
 * Resolves Bluesky post metadata via the public API
 * Fetches the post from the Bluesky API to extract uri and cid
 *
 * @param url - The Bluesky post URL
 * @returns Promise resolving to { uri, cid } or null if resolution fails
 *
 * @example
 * ```ts
 * const data = await resolveBlueskeyEmbed('https://bsky.app/profile/user.bsky.social/post/3m7bl6h22qk26')
 * // Returns: { uri: 'at://did:plc:xxxx/app.bsky.feed.post/3m7bl6h22qk26', cid: 'bafy...' }
 * ```
 */
export const resolveBlueskeyEmbed = async (url: string): Promise<{ uri: string; cid: string } | null> => {
  if (!isValidBlueskeyUrl(url)) {
    return null
  }

  try {
    // Extract handle and postId from URL
    const match = url.match(BLUESKY_REGEX)
    if (!match || !match[1] || !match[2]) {
      return null
    }

    const handle = match[1]
    const postId = match[2]

    // First, resolve the handle to a DID via the profile endpoint
    const profileResponse = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`,
    )

    if (!profileResponse.ok) {
      console.warn(`Failed to resolve profile for handle: ${handle}`)
      return null
    }

    const profile = (await profileResponse.json()) as { did: string }
    const did = profile.did

    // Now fetch the post using the resolved DID
    const postResponse = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(
        `at://${did}/app.bsky.feed.post/${postId}`,
      )}&depth=0`,
    )

    if (!postResponse.ok) {
      console.warn(`Failed to fetch post: ${postId} from user: ${did}`)
      return null
    }

    const postData = (await postResponse.json()) as {
      thread?: { post?: { uri: string; cid: string } }
    }
    const post = postData?.thread?.post

    if (post?.uri && post?.cid) {
      return { uri: post.uri, cid: post.cid }
    }

    console.warn('Post data missing uri or cid:', { post, postData })
    return null
  } catch (error) {
    console.warn('Failed to resolve Bluesky embed:', error)
    return null
  }
}
