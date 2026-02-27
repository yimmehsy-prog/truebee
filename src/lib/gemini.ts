export interface GenerateOptions {
  topic: string;
  highlights?: string;
  platform: string;
  tone: string;
  length: string;
  language: string;
}

export async function generateCopy(options: GenerateOptions) {
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

  const data = await response.json();
  return data.content;
}
