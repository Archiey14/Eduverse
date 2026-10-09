import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { ENV } from "../config/env.js";

class AIService {
  constructor() {
    if (ENV.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
      this.geminiModel = this.genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    }
    if (ENV.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: ENV.GROQ_API_KEY });
    }
  }

  /**
   * Generates a response based on the lesson context and student's message.
   * @param {Object} lesson - The lesson document containing title and content.
   * @param {String} message - The student's question.
   * @returns {String} The AI's generated response.
   */
  async getLessonChatResponse(lesson, message) {
    if (!this.model) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    const systemPrompt = `
You are an expert Teaching Assistant for the Eduverse platform.
Your goal is to help a student understand the following lesson.
Do NOT hallucinate information outside of this context. If you don't know the answer based on the lesson, politely say so.

--- LESSON CONTEXT ---
Title: ${lesson.title}
Description: ${lesson.description}
Content: ${lesson.content || "No detailed text content provided. Assume this is a video lesson."}
----------------------
`;

    // Construct the chat history with the system prompt as the first message
    const chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to help the student based on this lesson." }],
        },
      ],
    });

    let retries = 3;
    while (retries > 0) {
      try {
        const result = await chat.sendMessage(message);
        return result.response.text();
      } catch (error) {
        if (error.message?.includes("503") || error.message?.includes("high demand")) {
          retries--;
          if (retries === 0) {
            throw new Error("EduBot is currently experiencing high demand. Please try asking your question again in a moment.");
          }
          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw error;
        }
      }
    }
  }

  async *getLessonChatStream(lesson, message) {
    const systemPrompt = `
You are an expert Teaching Assistant for the Eduverse platform.
Your goal is to help a student understand the following lesson.
If the student asks a question related to the lesson, answer it in detail based on the lesson context.
If the student asks an irrelevant or general question outside of this context, you SHOULD still answer it to the best of your ability as a helpful AI assistant.

--- LESSON CONTEXT ---
Title: ${lesson.title}
Description: ${lesson.description}
Content: ${lesson.content || "No detailed text content provided. Assume this is a video lesson."}
----------------------
`;

    // Try Groq first for blazing fast speeds
    if (this.groq) {
      try {
        const stream = await this.groq.chat.completions.create({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            yield content;
          }
        }
        
        return;
      } catch (groqError) {
        console.warn("Groq streaming failed, falling back to Gemini:", groqError.message);
      }
    }

    // Fallback to Gemini
    if (this.geminiModel) {
      try {
        const chat = this.geminiModel.startChat({
          history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood." }] },
          ],
        });
        
        const result = await chat.sendMessageStream(message);
        for await (const chunk of result.stream) {
          yield chunk.text();
        }
        
        return;
      } catch (geminiError) {
        console.error("Gemini fallback also failed:", geminiError.message);
        throw new Error("Both AI providers failed. Please try again later.");
      }
    }

    throw new Error("No AI providers configured.");
  }
}

export const aiService = new AIService();
