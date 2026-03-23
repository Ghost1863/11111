import { useEffect, useState } from "react";

export default function useGorgoDocsLink() {
  const [gorgoDocsLink, setGorgoDocsLink] = useState("")

  useEffect(() => {
    const parts = window.location.hostname.split('.') || []
    let baseDomain
    if (parts.length <= 1)
      baseDomain = 'com' // localhost or similar
    else
      baseDomain = parts.slice(-1).join('.')

    setGorgoDocsLink(`https://docs.gorgojs.${baseDomain}`)
  }, [])

  return gorgoDocsLink
}
