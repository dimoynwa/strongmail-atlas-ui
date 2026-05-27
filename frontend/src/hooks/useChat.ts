import { useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';
import { streamChat } from '../api/chat';
import type { Message } from '../types';

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useChat() {
  const sessionId = useSessionStore((state) => state.sessionId);
  const isStreaming = useSessionStore((state) => state.isStreaming);

  const sendMessage = useCallback(
    async (content: string, agent: 'template' | 'general' = 'template') => {
      if (!content.trim() || isStreaming) return;
      if (agent === 'template' && !sessionId) return;

      const store = useSessionStore.getState();
      const userMessage: Message = {
        id: createMessageId(),
        role: 'user',
        content: content.trim(),
        agent,
      };

      useSessionStore.setState({
        messages: [...store.messages, userMessage],
        isStreaming: true,
        streamingText: '',
        activeTool: null,
      });

      await streamChat({
        sessionId: agent === 'template' ? sessionId : null,
        agent,
        message: content.trim(),
        onToken: (text) => {
          useSessionStore.setState((state) => ({
            streamingText: state.streamingText + text,
          }));
        },
        onTool: (name) => {
          useSessionStore.setState({ activeTool: name });
        },
        onFinal: (event) => {
          const assistantMessage: Message = {
            id: createMessageId(),
            role: 'assistant',
            content: event.text,
            diff: event.diff,
            snapshotOverwritten: event.snapshotOverwritten,
            agent,
            results: event.results,
          };

          const nextState = useSessionStore.getState();
          useSessionStore.setState({
            messages: [...nextState.messages, assistantMessage],
            streamingText: '',
            activeTool: null,
            isStreaming: false,
            generalResultCards: event.results?.length
              ? [...nextState.generalResultCards, ...event.results]
              : nextState.generalResultCards,
          });
        },
        onError: (message) => {
          const errorMessage: Message = {
            id: createMessageId(),
            role: 'assistant',
            content: message,
            agent,
          };
          useSessionStore.setState((state) => ({
            messages: [...state.messages, errorMessage],
            streamingText: '',
            activeTool: null,
            isStreaming: false,
          }));
        },
      });
    },
    [sessionId, isStreaming],
  );

  return { sendMessage, isStreaming };
}
