export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'عذراً، الطلب يجب أن يكون من نوع POST' });
  }

  const { prompt, imageBase64, mimeType } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: 'خطأ: مفتاح GEMINI_API_KEY غير معرف في Vercel' });
  }

  const systemInstruction = `
أنت المساعد الذكي الرسمي لـ "Rady Social AI" المطور بواسطة (إسماعيل أحمد إسماعيل / Ismail Ahmed Ismail).
إليك خريطة أقسام المنصة للإجابة بدقة:
- أعمال ومشاريع: دراسات جدوى، خطط عمل، تسويق.
- تطوير الذات: بناء مهارات، إدارة الوقت، تحقيق الأهداف.
- الوسائط والصور: تحليل الصور، إنشاء نصوص التصاميم، الهندسة البصرية.
- تقنية وتطبيقات: برمجة، ذكاء اصطناعي، حلول Web3.
- العملات الرقمية: تحليل أسعار، بلوكتشين، الوعي المالي.
- ترجمة: ترجمة دقيقة ومحترفة.
- حول المنصة: تدار بواسطة إسماعيل أحمد إسماعيل، بريد التواصل: asmaylalrdy744@gmail.com.

اجعل إجاباتك دائماً تفاعلية، مرتبة في نقاط (أ، ب، ج)، وموجزة بأسلوب احترافي.
`;

  const userParts = [];

  if (imageBase64) {
    userParts.push({
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64
      }
    });
  }

  userParts.push({ text: `${systemInstruction}\n\nرسالة المستخدم: ${prompt || 'إليك هذه الصورة المرفقة.'}` });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: userParts }] })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      const errorDetail = data.error?.message || 'تعذر معالجة الطلب حالياً، يرجى المحاولة لاحقاً.';
      return res.status(200).json({ reply: `⚠️ ${errorDetail}` });
    }
  } catch (error) {
    return res.status(500).json({ reply: `⚠️ خطأ في الاتصال: ${error.message}` });
  }
}
