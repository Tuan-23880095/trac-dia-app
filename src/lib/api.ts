export async function fetchGAS(action: string, payload: any) {
  const url = process.env.NEXT_PUBLIC_GAS_API_URL!;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // Bắt buộc dùng text/plain để tránh lỗi CORS preflight với GAS
    body: JSON.stringify({ action, payload }),
  });
  return response.json();
}
