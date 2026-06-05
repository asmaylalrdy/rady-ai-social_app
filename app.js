// Rady Social AI - Frontend Logic

const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const messages = document.getElementById("messages");

// إضافة رسالة في الشاشة
function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = "message " + type;
    div.innerText = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// إرسال الرسالة
async function sendMessage() {

    const text = input.value.trim();
    if (!text) return;

    // عرض رسالة المستخدم
    addMessage(text, "user");

    input.value = "";

    // رسالة انتظار
    const loading = document.createElement("div");
    loading.className = "message ai";
    loading.innerText = "⏳ جاري التفكير...";
    messages.appendChild(loading);

    try {

        // لاحقاً سنربطه بالـ Backend
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: text })
        });

        const data = await response.json();

        loading.remove();

        addMessage(data.reply || "لا يوجد رد", "ai");

    } catch (err) {

        loading.innerText = "حدث خطأ في الاتصال";

    }
}

// زر الإرسال
sendBtn.addEventListener("click", sendMessage);

// Enter key
input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});
