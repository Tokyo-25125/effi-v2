// CommandCode Provider API test suite
// Tests the 5 endpoints shown in the user's reference:
// 1. GET  /provider/v1/models (Models list)
// 2. POST /provider/v1/chat/completions (OpenAI Chat Completions)
// 3. POST /provider/v1/responses (OpenAI Responses)
// 4. POST /provider/v1/messages (Anthropic Messages)
// 5. POST /provider/v1/systemone (System One decisions - typesafe/jev)

const apiKey =
  process.env.COMMANDCODE_API_KEY ||
  process.env.OPENCODE_API_KEY ||
  process.argv[2];

const baseUrl = process.env.COMMANDCODE_BASE_URL || "https://api.commandcode.ai/provider/v1";

console.log("=========================================");
console.log(" CommandCode Provider API Endpoint Tester");
console.log(" Base URL:", baseUrl);
console.log(" API Key:", apiKey.slice(0, 10) + "..." + apiKey.slice(-6));
console.log("=========================================\n");

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${apiKey}`,
};

async function testModels() {
  console.log("1. GET /provider/v1/models");
  try {
    const res = await fetch(`${baseUrl}/models`);
    const data = await res.json();
    if (res.ok && Array.isArray(data.data)) {
      console.log(`   Status: ${res.status} OK`);
      console.log(`   Total models cataloged: ${data.data.length}`);
      const sample = data.data.slice(0, 4).map((m) => m.id).join(", ");
      console.log(`   Sample models: ${sample}...`);
      return true;
    } else {
      console.log(`   Status: ${res.status}`, data);
      return false;
    }
  } catch (err) {
    console.error("   Error:", err.message);
    return false;
  }
}

async function testChatCompletions() {
  console.log("\n2. POST /provider/v1/chat/completions (OpenAI Chat Completions)");
  const model = "Qwen/Qwen3.8-Flash";
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with the single word: PONG" }],
        max_tokens: 16,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   Status: ${res.status} OK (model: ${model})`);
      console.log("   Output:", data.choices?.[0]?.message?.content?.trim());
      return true;
    } else {
      console.log(`   Status: ${res.status}`, data.error?.message || data);
      return false;
    }
  } catch (err) {
    console.error("   Error:", err.message);
    return false;
  }
}

async function testResponses() {
  console.log("\n3. POST /provider/v1/responses (OpenAI Responses)");
  const model = "meta/muse-spark-1.3-contributor";
  try {
    const res = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        input: [{ role: "user", content: "Reply with the single word: PONG" }],
        max_output_tokens: 16,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   Status: ${res.status} OK (model: ${model})`);
      const text = data.output?.[0]?.content?.[0]?.text || data.output_text || JSON.stringify(data.output || data);
      console.log("   Output:", text);
      return true;
    } else {
      console.log(`   Status: ${res.status}`, data.error?.message || data);
      return false;
    }
  } catch (err) {
    console.error("   Error:", err.message);
    return false;
  }
}

async function testMessages() {
  console.log("\n4. POST /provider/v1/messages (Anthropic Messages)");
  const model = "claude-haiku-4-5-20251001";
  try {
    const res = await fetch(`${baseUrl}/messages`, {
      method: "POST",
      headers: {
        ...headers,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Reply with the single word: PONG" }],
        max_tokens: 16,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   Status: ${res.status} OK (model: ${model})`);
      console.log("   Output:", data.content?.[0]?.text);
      return true;
    } else {
      console.log(`   Status: ${res.status} (model: ${model})`);
      console.log(`   Note: ${data.error?.message || JSON.stringify(data)}`);
      return false;
    }
  } catch (err) {
    console.error("   Error:", err.message);
    return false;
  }
}

async function testSystemOne() {
  console.log("\n5. POST /provider/v1/systemone (System One decisions - typesafe/jev)");
  try {
    const res = await fetch(`${baseUrl}/systemone`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "typesafe/jev",
        state: "There is garbage dumped near our residential complex entrance.",
        questions: {
          is_civic_issue: {
            type: "noul",
            instructions: "Is this a municipal or civic issue?",
          },
          urgency: {
            type: "noul",
            instructions: "Does this require prompt action?",
          },
        },
      }),
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   Status: ${res.status} OK (model: typesafe/jev)`);
      console.log("   Decisions:", JSON.stringify(data.answers, null, 2));
      return true;
    } else {
      console.log(`   Status: ${res.status}`, data.error?.message || data);
      return false;
    }
  } catch (err) {
    console.error("   Error:", err.message);
    return false;
  }
}

async function run() {
  await testModels();
  await testChatCompletions();
  await testResponses();
  await testMessages();
  await testSystemOne();
  console.log("\n=========================================");
  console.log(" All endpoints tested.");
  console.log("=========================================");
}

run();
