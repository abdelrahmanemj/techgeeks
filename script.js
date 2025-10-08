export async function POST(req) {
  const body = await req.json();

  const formData = new URLSearchParams();
  formData.append("entry.368558942", body.firstName);
  formData.append("entry.1809475310", body.lastName);
  formData.append("entry.262113261", body.email);
  formData.append("entry.530200106", body.phoneNumber);

  const response = await fetch(
    "https://docs.google.com/forms/d/e/1FAIpQLSentrbNhwl6kuOoWmnyuozUYNMT0Ii88Sdrw0sdBGmdPKSIig/formResponse",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://docs.google.com",
        Referer:
          "https://docs.google.com/forms/d/e/1FAIpQLSentrbNhwl6kuOoWmnyuozUYNMT0Ii88Sdrw0sdBGmdPKSIig/viewform",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/137.0.0.0 Safari/537.36",
      },
      body: formData,
    }
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ success: false }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}