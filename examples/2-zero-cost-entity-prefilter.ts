/**
 * Example 2: Zero-Cost Local Entity Pre-Filter (LLM Cost Optimization)
 *
 * Scenario: Ingesting high-volume support tickets or leads.
 * Sending every raw message straight to GPT-4/Gemini costs $0.03-$0.10 per call and takes ~2 seconds.
 *
 * Qirrel runs local deterministic entity parsing (<1ms). If contact info is detected,
 * it routes the lead instantly to CRM/Helpdesk without ever calling an LLM API.
 */

import { processTexts } from '../src';

interface IncomingTicket {
  id: string;
  rawText: string;
}

const incomingTickets: IncomingTicket[] = [
  { id: 'T-101', rawText: 'Please update my billing email to billing-department@company.org immediately.' },
  { id: 'T-102', rawText: 'Can you call me at +44 20 7946 0958 regarding order #9821?' },
  { id: 'T-103', rawText: 'I am really unsatisfied with the recent software update interface design.' },
  { id: 'T-104', rawText: 'Check out the issue screenshot uploaded at https://status.example.com/bug-404' },
];

async function main() {
  console.log(`Processing ${incomingTickets.length} tickets through Qirrel local pre-filter...\n`);

  const rawTexts = incomingTickets.map(t => t.rawText);

  // Process batch through Qirrel with high concurrency locally (0 API costs)
  const startTime = Date.now();
  const contexts = await processTexts(rawTexts, undefined, { concurrency: 4 });
  const duration = Date.now() - startTime;

  let llmCallsSaved = 0;
  let llmCallsRequired = 0;

  contexts.forEach((ctx, index) => {
    const ticket = incomingTickets[index]!;
    const entities = ctx.data?.entities || [];

    console.log(`Ticket [${ticket.id}]:`);
    console.log(`  Text: "${ticket.rawText}"`);

    if (entities.length > 0) {
      llmCallsSaved++;
      console.log(`  ⚡ Fast-Path (0ms, $0): Extracted ${entities.length} entity(ies) locally:`);
      entities.forEach(e => console.log(`     -> [${e.type}] ${e.value}`));
      console.log(`     Action: Auto-routed to CRM / DB without LLM invocation.`);
    } else {
      llmCallsRequired++;
      console.log(`  🤖 Slow-Path: No deterministic entities found.`);
      console.log(`     Action: Routing to LLM for complex semantic analysis...`);
    }
    console.log('');
  });

  console.log('========================================================');
  console.log(`Batch processed in ${duration}ms locally.`);
  console.log(`LLM API Calls Saved: ${llmCallsSaved} (${((llmCallsSaved / incomingTickets.length) * 100).toFixed(0)}% cost reduction)`);
  console.log(`LLM API Calls Required: ${llmCallsRequired}`);
  console.log('========================================================');
}

main().catch(console.error);
