// ai-improve-api.js
// Local AI API for self-improving HTML pages (runs with llama.cpp server)

class AIImprover {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'http://localhost:8080/completion';
        this.model = options.model || 'qwen2-7b-instruct';
        this.temperature = options.temperature || 0.7;
        this.maxTokens = options.maxTokens || 2048;
        this.gpuLayers = options.gpuLayers || 45;
    }

    // Generate improvement prompt
    _buildPrompt(html) {
        return `You are an expert full-stack AI engineer. Improve this HTML page by:
1. Fixing any broken WebAssembly or JavaScript logic
2. Adding self-learning behavior (e.g., neuron adapts firing probability based on history)
3. Enhancing UI with real-time stats, charts, or animations
4. Ensuring all code remains in a single HTML file
5. Making it more interactive and educational

Return ONLY the complete, valid HTML code. No explanations. Start with <!DOCTYPE html>.

Original code:
${html}`;
    }

    // Send request to local LLM
    async improve(html) {
        const prompt = this._buildPrompt(html);
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    temperature: this.temperature,
                    top_p: 0.9,
                    n_predict: this.maxTokens,
                    stop: ["```", "</html>"]
                })
            });

            if (!response.ok) {
                throw new Error(`LLM server error: ${response.status}`);
            }

            const data = await response.json();
            let improved = data.content || data.response || '';

            // Ensure valid HTML structure
            if (!improved.trim().startsWith('<!DOCTYPE')) {
                improved = '<!DOCTYPE html>\n' + improved;
            }
            if (!improved.includes('</html>')) {
                improved += '\n</html>';
            }

            return improved;
        } catch (error) {
            console.error('AIImprover error:', error);
            throw new Error(`Failed to improve page: ${error.message}`);
        }
    }

    // Apply improved HTML to current page
    applyImprovedHtml(html) {
        document.open();
        document.write(html);
        document.close();
        
        // Re-inject this API script so improvements can continue
        const script = document.createElement('script');
        script.src = 'ai-improve-api.js';
        document.head.appendChild(script);
    }
}

// Auto-initialize if used as module
if (typeof window !== 'undefined') {
    window.AIImprover = AIImprover;
}
