export default async function handler(req, res) {
  // استقبال طلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, task } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'رقم الهاتف مطلوب لاستكمال الاتصال.' });
  }

  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'لم يتم العثور على VAPI_API_KEY في متغيّرات البيئة.' });
  }

  try {
    // إرسال طلب الاتصال المباشر إلى Vapi API
    const response = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: phone,
        assistant: {
          firstMessage: `أهلاً بك ${name || ''}، معك المساعد الذكي من منصة رضي إي آي. كيف يمكنني مساعدتك اليوم؟`,
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `أنت مساعد صوتي ذكي باللغة العربية تابع لمنصة Rady Social AI. تحدث بلباقة وأسلوب ودود ومختصر. هدف هذه المكالمة المحدد هو: ${task || "الترحيب بالمستلم وإجراء مكالمة تجريبية"}.`
              }
            ]
          },
          voice: {
            provider: "azure",
            voiceId: "ar-SA-HamedNeural" // صوت عربي طبيعي وممتاز
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Vapi Error:', data);
      return res.status(response.status).json({ error: data.message || 'فشل إرسال طلب المكالمة إلى Vapi' });
    }

    return res.status(200).json({ success: true, callId: data.id });
  } catch (err) {
    console.error('Server Error:', err);
    return res.status(500).json({ error: 'حدث خطأ في الخادم أثناء الاتصال بـ Vapi.' });
  }
}
