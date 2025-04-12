import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "your-api-key" });

// Legal consultation chatbot function
export async function getLegalConsultation(
  message: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  try {
    const messages = [
      {
        role: "system",
        content: 
          "You are LegalAssistAI, a helpful assistant providing preliminary legal information. " +
          "You should provide general legal information, but make it clear you're not giving legal advice or " +
          "creating an attorney-client relationship. For complex situations, recommend consulting with a licensed attorney. " +
          "Focus on being informative, professional, and helpful while staying within these boundaries."
      },
      ...history,
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't process your request at this time.";
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
  }
}

// Legal document analysis
export async function analyzeLegalDocument(text: string): Promise<{
  summary: string;
  keyPoints: string[];
  suggestedActions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a legal document analyzer. Review the provided document text and extract key information. " +
            "Provide a summary, key points, and suggested actions. Respond with JSON in this format: " +
            "{ 'summary': string, 'keyPoints': string[], 'suggestedActions': string[] }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      summary: result.summary || "No summary available",
      keyPoints: result.keyPoints || [],
      suggestedActions: result.suggestedActions || []
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    return {
      summary: "Error analyzing document. Please try again later.",
      keyPoints: [],
      suggestedActions: ["Contact support if this issue persists."]
    };
  }
}

// Get relevant lawyer recommendations based on legal issue
export async function getLawyerRecommendations(legalIssueDescription: string): Promise<{
  specializations: string[];
  relevantQuestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a legal consultant helping clients find appropriate legal representation. " +
            "Based on the description of a legal issue, identify the most relevant legal specializations needed " +
            "and suggest important questions the client should ask potential lawyers. " +
            "Respond with JSON in this format: { 'specializations': string[], 'relevantQuestions': string[] }"
        },
        {
          role: "user",
          content: legalIssueDescription
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      specializations: result.specializations || ["General Practice"],
      relevantQuestions: result.relevantQuestions || ["What is your experience with cases like mine?"]
    };
  } catch (error) {
    console.error("Error getting lawyer recommendations:", error);
    return {
      specializations: ["General Practice"],
      relevantQuestions: ["What is your experience with cases like mine?"]
    };
  }
}
