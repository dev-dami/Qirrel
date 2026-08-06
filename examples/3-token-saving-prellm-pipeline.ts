/**
 * Example 3: Token-Saving Pre-LLM Pipeline (HTML & Prompt Compression)
 *
 * Scenario: Before sending user-submitted messages, scrape dumps, or web input to an LLM
 * for summarization or RAG embeddings, Qirrel cleans out HTML tags, extra whitespace,
 * filler words, and positional metadata. This reduces input token usage by 30-50% on every API call.
 */

import { Pipeline, speechClean } from '../src';

async function main() {
  const dirtyWebHookPayload = `
    <div>
      <p>Um, so basically, we received a new inquiry from our web form!</p>
      <p>Contact person: <strong>Jane Doe</strong></p>
      <p>Email: <a href="mailto:jane.doe@enterprise-corp.com">jane.doe@enterprise-corp.com</a></p>
      <p>Phone: +1 (555) 019-2834</p>
      <p>Website: https://enterprise-corp.com/welcome</p>
      <p>Message: Uh, you know, we are looking to purchase 500 licenses for our team ASAP!!!</p>
    </div>
  `;

  // Create a customized Qirrel pre-LLM pipeline
  const pipeline = new Pipeline();

  // Add transcript/speech cleaning component to strip spoken fillers
  pipeline.use(speechClean({
    removeFillerWords: true,
    detectRepetitions: true,
    findStutters: true
  }));

  console.log("=== ORIGINAL UNPROCESSED PAYLOAD ===");
  console.log(`Length: ${dirtyWebHookPayload.length} chars (~${Math.ceil(dirtyWebHookPayload.length / 4)} tokens)`);
  console.log(dirtyWebHookPayload);
  console.log("\n----------------------------------------\n");

  const context = await pipeline.process(dirtyWebHookPayload);

  const cleanText = context.data?.text || '';
  const entities = context.data?.entities || [];

  console.log("=== QIRREL PRE-LLM COMPRESSED PAYLOAD ===");
  console.log(`Length: ${cleanText.length} chars (~${Math.ceil(cleanText.length / 4)} tokens)`);
  console.log(cleanText);
  console.log("\n----------------------------------------\n");

  console.log("=== PRE-EXTRACTED ENTITIES (FOR SYSTEM PROMPT CONTEXT) ===");
  console.log(entities);

  const savingsPercent = (((dirtyWebHookPayload.length - cleanText.length) / dirtyWebHookPayload.length) * 100).toFixed(1);
  console.log(`\n⚡ Prompt Token Compression Savings: ${savingsPercent}% reduction in payload size!`);
}

main().catch(console.error);
