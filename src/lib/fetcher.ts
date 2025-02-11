export async function fetcher(endpoint: string, options?: RequestInit) {
    const res = await fetch(endpoint, {
      method: options?.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })
  
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'API request failed')
    }
  
    return res.json()
  }
  