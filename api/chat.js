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
- تعليم مهارات: تعليم صيانة الأجهزة والمعدات، الصناعات المنزلية الخفيفة (حلويات، أجبان، حليب مجفف، صابون ومنظفات)، الحرف والمهارات العملية خطوة بخطوة.
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
    } else if (data.error) {
      if (data.error.code === 429 || data.error.message?.includes('quota')) {
        return res.status(200).json({ 
          reply: '⏳ لقد استهلكت حد الاستخدام المجاني اليومي. يرجى الانتظار 12 ساعة لتجديد الرصيد أو اضغط على زر "🌟 اشتراك Pi" لفتح الاستخدام اللامحدود فوراً!' 
        });
      }
      return res.status(200).json({ reply: `⚠️ ${data.error.message}` });
    } else {
      return res.status(200).json({ reply: 'تعذر معالجة الطلب حالياً، يرجى المحاولة لاحقاً.' });
    }
  } catch (error) {
    return res.status(500).json({ reply: `⚠️ خطأ في الاتصال: ${error.message}` });
  }
}
