export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(200).json({ text: getLocalSmartResponse(prompt) });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `أنت مساعد ذكي لمنصة Rady Social AI الخاصة بالمطور إسماعيل أحمد الرضي. أجب بدقة واستخدم الترقيم بالحروف (أ، ب، ج) للنقاط الفرعية:\n${prompt}`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return res.status(200).json({ text: data.candidates[0].content.parts[0].text });
        } else {
            return res.status(200).json({ text: getLocalSmartResponse(prompt) });
        }
    } catch (error) {
        return res.status(200).json({ text: getLocalSmartResponse(prompt) });
    }
}

function getLocalSmartResponse(q) {
    const text = q.trim();
    if (text === '4' || text === '٤' || text.includes('عملات')) {
        return "4️⃣ **العملات الرقمية 💰**\n\nأهلاً بك في قسم العملات الرقمية!\n\n🪙 **المواضيع الرئيسية:**\nأ) **Pi Network:** التحديثات والتعدين والشبكة المفتوحة Mainnet.\nب) **البلوكتشين:** شرح مبسط لسلسلة الكتل.\nج) **المحافظ الرقمية:** الأمان والتشفير.\n\n🎯 **الأسئلة الشائعة:**\nأ) هل Pi آمنة؟ (نعم، تعمل بتشفير متقدم).\nب) متى يُفتح Mainnet؟ (العمل جارٍ في التحديثات المستمرة).\n\nاطرح سؤالك أو اختر موضوعاً لنبدأ ⚡🚀";
    }
    if (text === '1' || text === '١') return "1️⃣ **أعمال ومشاريع:** دراسات جدوى، خطط عمل، واستراتيجيات تسويق. ماذا نناقش اليوم؟ 🚀";
    if (text === '2' || text === '٢') return "2️⃣ **تطوير الذات:** تنظيم الوقت، بناء العادات، والتخطيط الشخصي. أرسل استفسارك 🎯";
    if (text === '3' || text === '٣') return "3️⃣ **تقنية وتطبيقات:** مراجعة الأكواد، الواجهات البرمجية، وVercel. أرسل استفسارك 💻";
    if (text === '5' || text === '٥') return "5️⃣ **قسم الترجمة الفورية:** أرسل النص باللغة العربية أو الإنجليزية وسأترجمه لك فوراً ⚡";
    if (text === '6' || text === '٦') return "6️⃣ **الإعدادات ⚙️:** يمكنك التحكم باللغة، المظهر، وحسابك الشخصي.";
    if (text === '7' || text === '٧') return "7️⃣ **حول المنصة ℹ️:** Rady Social AI - منصتك الذكية الشاملة بإدارة إسماعيل أحمد الرضي.";

    return `💡 **استلمت طلبك بنجاح:**\n"${q}"\n\nأ) اختر القسم المطلوب (1-7).\nب) أو اكتب تفاصيل سؤالك مباشرة لنشرحه لك ⚡🚀`;
}
