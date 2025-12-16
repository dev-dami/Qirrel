export enum PipelineEvent {
  RunStart = 'run.start',
  RunEnd = 'run.end',
  ProcessorStart = 'processor.start',
  ProcessorEnd = 'processor.end',
  LLMCall = 'llm.call',
  Error = 'error'
}

export type EventHandler<T = any> = (payload?: T) => void | Promise<void>;

export interface RunStartPayload {
  context: any;
}

export interface RunEndPayload {
  context: any;
  duration: number;
}

export interface ProcessorStartPayload {
  processorName: string;
  context: any;
}

export interface ProcessorEndPayload {
  processorName: string;
  context: any;
  duration: number;
}

export interface LLMCallPayload {
  prompt: string;
  response: any;
  model: string;
  duration: number;
}

export interface ErrorPayload {
  error: Error;
  context?: any;
  stage?: 'run' | 'processor' | 'llm';
}