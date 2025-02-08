interface PromptResponse {
  status: 'success' | 'error';
  stage: string;
  data: any;
  validation: {
    isComplete: boolean;
    missingFields: string[];
    formatErrors: string[];
  };
}

class PromptChainValidator {
  private static validateInitialAnalysis(response: any): PromptResponse {
    const requiredFields = ['purpose', 'components', 'data_flow', 'patterns'];
    const missingFields = requiredFields.filter(field => !response[field]);
    
    return {
      status: missingFields.length === 0 ? 'success' : 'error',
      stage: '1_initial_analysis',
      data: response,
      validation: {
        isComplete: missingFields.length === 0,
        missingFields,
        formatErrors: []
      }
    };
  }

  private static validateComplexityAssessment(response: any): PromptResponse {
    const requiredFields = ['complex_areas'];
    const missingFields = requiredFields.filter(field => !response[field]);
    
    return {
      status: missingFields.length === 0 ? 'success' : 'error',
      stage: '2_complexity_assessment',
      data: response,
      validation: {
        isComplete: missingFields.length === 0,
        missingFields,
        formatErrors: []
      }
    };
  }

  // Add similar validation methods for other stages...

  public static validateChainResponse(stage: string, response: any): PromptResponse {
    switch(stage) {
      case '1_initial_analysis':
        return this.validateInitialAnalysis(response);
      case '2_complexity_assessment':
        return this.validateComplexityAssessment(response);
      // Add other cases...
      default:
        throw new Error(`Unknown stage: ${stage}`);
    }
  }
}

export { PromptChainValidator, PromptResponse };