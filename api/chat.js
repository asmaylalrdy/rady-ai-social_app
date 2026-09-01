export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'عذراً، الطلب يجب أن يكون من نوع POST' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: 'خطأ: مفتاح GEMINI_API_KEY غير معرف في Vercel' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `أنت مساعد ذكي لتطبيق Rady Social AI. أجب على السؤال التالي بأسلوب منظم (استخدم الترقيم بالحروف أ، ب، ج عند التفصيل):\n\n${prompt}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ reply: aiReply });
    } else {
      const errorDetail = data.error?.message || 'لم يتم الحصول على إجابة من النموذج';
      return res.status(200).json({ reply: `⚠️ خطأ من الذكاء الاصطناعي: ${errorDetail}` });
    }
  } catch (error) {
    return res.status(500).json({ reply: `⚠️ خطأ في الاتصال بالخادم: ${error.message}` });
  }
}
