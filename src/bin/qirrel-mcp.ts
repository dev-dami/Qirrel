#!/usr/bin/env node
import { createQirrelAgentBridge, startMcpStdioServer } from "../agent";

const configPath = process.argv[2];
const bridge = createQirrelAgentBridge(configPath);

startMcpStdioServer(bridge);
