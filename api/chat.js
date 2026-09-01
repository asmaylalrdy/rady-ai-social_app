export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'عذراً، الطلب يجب أن يكون من نوع POST' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: 'خطأ: مفتاح GEMINI_API_KEY غير معرف في Vercel' });
  }

  // التوجيه الذكي ومزامنة الأرقام مع القائمة الترحيبية
  const systemInstruction = `
أنت المساعد الذكي الرسمي لـ "Rady Social AI".
إذا أدخل المستخدم رقماً مجرداً (1 إلى 7)، يجب أن ترتبط إجابتك مباشرة بالأقسام التالية:
1 = أعمال ومشاريع (تقديم استشارات للتخطيط، دراسات الجدوى، الهوية التجارية، وتطوير الأداء).
2 = تطوير الذات (مهارات النجاح، تنظيم الوقت، التحفيز، وإدارة الأهداف).
3 = تقنية وتطبيقات (تطوير البرمجيات، الذكاء الاصطناعي، الحلول التقنية، وWeb3).
4 = العملات الرقمية (تحليل السوق، البلوكتشين، والتداول والوعي المالي).
5 = ترجمة عربي ↔ إنجليزي (تقديم ترجمة احترافية وتدقيق نصوص).
6 = الإعدادات (إرشادات تخصيص الحساب وتفضيلات الاستخدام).
7 = حول المنصة (تعريف شامل بـ Rady Social AI، رؤيتها، وميزاتها).

نسق إجابتك دائماً بالنقاط المحددة (أ، ب، ج) مع استخدام نبرة احترافية وتفاعلية.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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
                  text: `${systemInstruction}\n\nرسالة المستخدم: ${prompt}`
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
