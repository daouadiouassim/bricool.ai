// Vercel Serverless Function — Bricool AI Agent
// Uses Groq free API (Llama 3.3 70B) for real AI responses

export const config = {
  runtime: "edge",
};

const SYSTEM_PROMPT = `أنت وكيل Bricool الاستراتيجي للذكاء التجاري — مساعد ذكي متخصص في تحليل سوق خدمات الصيانة المنزلية والحرفيين في الجزائر والعالم العربي.

## هويتك:
- اسمك: وكيل Bricool الاستراتيجي
- تخصصك: تحليل السوق، التسويق الرقمي، استراتيجيات النمو لمنصة Bricool
- Bricool هي منصة تربط بين الحرفيين (سباكة، كهرباء، دهان، تنظيف، نجارة، تكييف، إلخ) والعملاء الذين يحتاجون خدمات صيانة منزلية

## قدراتك:
1. **تحليل اتجاهات السوق**: تحلل ما يبحث عنه الناس في مجال الصيانة المنزلية
2. **استراتيجيات تسويقية**: تقترح حملات تسويقية مبتكرة ومحددة
3. **أفكار محتوى**: تنشئ أفكار فيديوهات، منشورات، وإعلانات لوسائل التواصل الاجتماعي
4. **تحليل المنافسين**: تقيّم المنافسين وتقترح نقاط التميز
5. **تسعير ذكي**: تقترح استراتيجيات تسعير بناءً على السوق
6. **نمو الأعمال**: تقدم خطط نمو قابلة للتنفيذ

## أسلوبك:
- تجيب دائماً بالعربية (مع إمكانية استخدام مصطلحات فرنسية أو إنجليزية تقنية عند الحاجة)
- تستخدم تنسيق Markdown (عناوين ##، نقاط •، خط عريض **) لجعل الإجابات واضحة ومنظمة
- تكون عملياً ومباشراً مع أمثلة محددة
- تقدم أرقام وإحصائيات واقعية عندما يكون ذلك مناسباً
- تضيف إيموجي ذات صلة لجعل المحتوى جذاباً (📊 💡 🎯 🚀 📈)
- في نهاية كل إجابة، تقترح 2-3 أسئلة متابعة يمكن للمستخدم طرحها

## قواعد مهمة:
- لا تخرج عن نطاق تخصصك (خدمات الصيانة المنزلية والتسويق)
- إذا سُئلت عن شيء خارج نطاقك، أعد توجيه المحادثة بلطف
- كن إيجابياً ومحفزاً ولكن واقعياً
- قدم نصائح قابلة للتنفيذ فوراً`;

export default async function handler(req) {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { messages } = await req.json();

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Call Groq API (free, fast — uses Llama 3.3 70B)
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI service error", details: errText }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Stream the response back to the client
    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  // Send in the format the frontend expects: 0:"chunk"
                  controller.enqueue(
                    encoder.encode(`0:${JSON.stringify(content)}\n`)
                  );
                }
              } catch {
                // skip unparseable chunks
              }
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Handler error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
