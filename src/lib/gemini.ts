export interface GenerateOptions {
  topic: string;
  highlights?: string;
  platform: string;
  tone: string;
  length: string;
  language: string;
}

export async function generateCopy(options: GenerateOptions, onUpdate?: (chunk: string) => void) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate copy');
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder("utf-8");
  let fullText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // Keep the last line in the buffer in case it's incomplete
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6);
        if (dataStr.trim() === '[DONE]') continue;
        
        try {
          const data = JSON.parse(dataStr);
          if (data.content) {
            fullText += data.content;
            if (onUpdate) onUpdate(fullText);
          }
        } catch (e) {
          // Ignore parse errors for incomplete chunks
        }
      }
    }
  }
  
  return fullText;
}
