interface ModelConfig {
  name: string;
  provider: string;
  costPerToken: number;
  maxTokens: number;
  strengths: string[];
  weaknesses: string[];
  reliability: number;
}

interface TaskRequirements {
  complexity: 'low' | 'medium' | 'high';
  creativity: 'low' | 'medium' | 'high';
  accuracy: 'low' | 'medium' | 'high';
  speed: 'low' | 'medium' | 'high';
  maxCost: number;
  fallbackRequired: boolean;
}

interface ModelSelection {
  primary: string;
  fallback?: string;
  reasoning: string;
}

export class ModelRoutingAgent {
  private models: Map<string, ModelConfig>;
  private costTracker: CostTracker;
  private performanceMonitor: PerformanceMonitor;

  constructor() {
    this.models = this.initializeModels();
    this.costTracker = new CostTracker();
    this.performanceMonitor = new PerformanceMonitor();
  }

  private initializeModels(): Map<string, ModelConfig> {
    return new Map([
      ['perplexity-sonar', {
        name: 'perplexity-sonar',
        provider: 'perplexity',
        costPerToken: 0.005,
        maxTokens: 4096,
        strengths: ['real-time knowledge', 'research', 'factual accuracy', 'crypto analysis'],
        weaknesses: ['creative tasks', 'complex reasoning'],
        reliability: 0.90
      }],
      ['gpt-3.5-turbo', {
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        costPerToken: 0.002,
        maxTokens: 4096,
        strengths: ['creative writing', 'general reasoning', 'speed', 'narrative generation'],
        weaknesses: ['complex analysis', 'accuracy'],
        reliability: 0.85
      }],
      ['gpt-4o', {
        name: 'gpt-4o',
        provider: 'openai',
        costPerToken: 0.01,
        maxTokens: 8192,
        strengths: ['complex reasoning', 'creativity', 'accuracy', 'pattern recognition'],
        weaknesses: ['cost', 'speed'],
        reliability: 0.93
      }]
    ]);
  }

  async selectBestModel(
    task: string,
    requirements: TaskRequirements,
    context?: any
  ): Promise<ModelSelection> {
    
    const candidates = Array.from(this.models.entries())
      .map(([name, config]) => ({
        name,
        config,
        score: this.calculateModelScore(config, requirements, task)
      }))
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score);

    if (candidates.length === 0) {
      throw new Error('No suitable model found for task');
    }

    const primary = candidates[0].name;
    const fallback = requirements.fallbackRequired && candidates.length > 1 
      ? candidates[1].name 
      : undefined;

    const reasoning = this.generateSelectionReasoning(candidates[0], task, requirements);

    // Track selection for learning
    this.performanceMonitor.recordSelection(task, primary, requirements);

    return { primary, fallback, reasoning };
  }

  private calculateModelScore(
    config: ModelConfig,
    requirements: TaskRequirements,
    task: string
  ): number {
    let score = config.reliability * 100; // Base score from reliability

    // Task-specific scoring
    if (task.includes('analyze') || task.includes('transaction')) {
      if (config.strengths.includes('factual accuracy')) score += 30;
      if (config.strengths.includes('real-time knowledge')) score += 20;
    }

    if (task.includes('narrative') || task.includes('creative')) {
      if (config.strengths.includes('creative writing')) score += 30;
      if (config.strengths.includes('narrative generation')) score += 25;
    }

    if (task.includes('pattern') || task.includes('detect')) {
      if (config.strengths.includes('pattern recognition')) score += 30;
      if (config.strengths.includes('complex reasoning')) score += 25;
    }

    // Requirements scoring
    const complexityWeight = requirements.complexity === 'high' ? 30 : 
                           requirements.complexity === 'medium' ? 20 : 10;
    
    if (config.strengths.includes('complex reasoning') && requirements.complexity === 'high') {
      score += complexityWeight;
    }

    // Cost consideration
    const estimatedCost = config.costPerToken * 1000; // Estimate for 1k tokens
    if (estimatedCost > requirements.maxCost) {
      score -= 50; // Heavy penalty for exceeding budget
    }

    // Speed consideration
    if (requirements.speed === 'high' && config.provider === 'openai') {
      score += 15; // OpenAI generally faster
    }

    return Math.max(0, score);
  }

  private generateSelectionReasoning(
    candidate: { name: string; config: ModelConfig; score: number },
    task: string,
    requirements: TaskRequirements
  ): string {
    const strengths = candidate.config.strengths.slice(0, 2).join(' and ');
    return `Selected ${candidate.name} for ${task} due to ${strengths} capabilities, matching ${requirements.complexity} complexity requirements`;
  }

  async executeWithModel<T>(
    modelName: string,
    prompt: string,
    options: any = {}
  ): Promise<T> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not configured`);
    }

    const startTime = Date.now();
    
    try {
      let result: T;
      
      switch (model.provider) {
        case 'perplexity':
          result = await this.executePerplexity<T>(prompt, options);
          break;
        case 'openai':
          result = await this.executeOpenAI<T>(modelName, prompt, options);
          break;
        default:
          throw new Error(`Provider ${model.provider} not implemented`);
      }

      const duration = Date.now() - startTime;
      this.performanceMonitor.recordExecution(modelName, duration, true);
      
      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.performanceMonitor.recordExecution(modelName, duration, false);
      throw error;
    }
  }

  private async executePerplexity<T>(prompt: string, options: any): Promise<T> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as T;
  }

  private async executeOpenAI<T>(model: string, prompt: string, options: any): Promise<T> {
    // Implementation would use OpenAI SDK
    throw new Error('OpenAI integration not implemented yet');
  }
}

class CostTracker {
  private totalCost: number = 0;
  private modelCosts: Map<string, number> = new Map();

  addCost(model: string, cost: number): void {
    this.totalCost += cost;
    const current = this.modelCosts.get(model) || 0;
    this.modelCosts.set(model, current + cost);
  }

  getTotalCost(): number {
    return this.totalCost;
  }

  getModelBreakdown(): Record<string, number> {
    return Object.fromEntries(this.modelCosts);
  }
}

class PerformanceMonitor {
  private selections: Array<{
    task: string;
    model: string;
    requirements: TaskRequirements;
    timestamp: number;
  }> = [];

  private executions: Array<{
    model: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }> = [];

  recordSelection(task: string, model: string, requirements: TaskRequirements): void {
    this.selections.push({
      task,
      model,
      requirements,
      timestamp: Date.now()
    });
  }

  recordExecution(model: string, duration: number, success: boolean): void {
    this.executions.push({
      model,
      duration,
      success,
      timestamp: Date.now()
    });
  }

  getAverageResponseTime(model: string): number {
    const modelExecutions = this.executions.filter(e => e.model === model && e.success);
    if (modelExecutions.length === 0) return 0;
    
    const totalTime = modelExecutions.reduce((sum, e) => sum + e.duration, 0);
    return totalTime / modelExecutions.length;
  }

  getSuccessRate(model: string): number {
    const modelExecutions = this.executions.filter(e => e.model === model);
    if (modelExecutions.length === 0) return 0;
    
    const successes = modelExecutions.filter(e => e.success).length;
    return successes / modelExecutions.length;
  }
}