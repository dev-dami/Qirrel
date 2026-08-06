/**
 * Example 1: Pre-LLM Voice Transcript Sanitizer
 *
 * Scenario: You are building a real-time Voice AI Agent (e.g. Twilio + Speech-To-Text + LLM).
 * STT outputs noisy transcripts with spoken fillers ("um", "uh", "you know"), stutters ("t-t-today"),
 * and word repetitions. Passing raw STT to an LLM wastes prompt tokens and causes the LLM to
 * repeat stutter patterns back to the user.
 *
 * Qirrel sanitizes the voice transcript in <1ms for $0 token cost before sending to the LLM.
 */

import { preprocessSpeechInput, processText } from '../src';

async function main() {
  const rawSttTranscript =
    "Um, hello! I'm calling, you know, because I need help with my account. " +
    "My email is support@example.com and my phone number is +1 415 555 2671. " +
    "I need this solved t-t-today, uh, as soon as possible!";

  console.log("=== RAW STT TRANSCRIPT FROM AUDIO ===");
  console.log(rawSttTranscript);
  console.log("\n----------------------------------------\n");

  // Step 1: Sanitize spoken filler words, stutters, and repetitions
  const sanitizedText = preprocessSpeechInput(rawSttTranscript, {
    removeFillerWords: true,
    detectRepetitions: true,
    findStutters: true,
  });

  console.log("=== QIRREL PRE-LLM SANITIZED TEXT (0ms, $0) ===");
  console.log(sanitizedText);
  console.log("\n----------------------------------------\n");

  // Step 2: Extract structured entities (emails, phone numbers) locally
  const result = await processText(sanitizedText);

  console.log("=== LOCALLY EXTRACTED ENTITIES FOR LLM CONTEXT ===");
  console.log(JSON.stringify(result.data?.entities, null, 2));

  console.log("\n=== FINAL CLEAN LLM PROMPT PAYLOAD ===");
  console.log(`
System Prompt: You are a customer support agent.
Context Entities: ${JSON.stringify(result.data?.entities)}
User Message: "${sanitizedText}"
  `.trim());
}

main().catch(console.error);
