"use server";

export async function checkURL(url: string) {
  if (!url.startsWith("http")) {
    return { exists: false, message: "올바른 URL 형식이 아닙니다." };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return { exists: response.ok, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { exists: false, message: "요청이 시간 초과되었습니다." };
      }
      return { exists: false, message: `URL 확인 중 오류 발생: ${error.message}` };
    }

    return { exists: false, message: "알 수 없는 오류가 발생했습니다." };
  }
}
