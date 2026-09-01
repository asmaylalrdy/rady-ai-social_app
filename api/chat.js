export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'مفتاح GEMINI_API_KEY غير متوفر في البيئة.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `أنت مساعد ذكي لمنصة Rady Social AI للباحث والمطور إسماعيل أحمد الرضي. أجب بدقة عالية، وقم بتنسيق النقاط الفرعية باستخدام الحروف (أ، ب، ج) بدلاً من الأرقام الفرعية:\n${prompt}`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
        } else {
            return res.status(500).json({ error: 'لم يتم استلام استجابة صحيحة.' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'حدث خطأ أثناء الاتصال بالمُعالج.' });
    }
}
