import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getInterviewQuestion = async (context: any[]) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an AI interviewer for a club. 
        The applicant's name is ${context[0].name}.
        Their past activities: ${context[0].activities}.
        Their club plan: ${context[0].plan}.
        
        Keep the interview professional and concise. 
        Ask one question at a time.
        Based on their application, ask about their experience or specific plans.
        Total questions should be around 5.`,
      },
      ...context.slice(1),
    ],
  });

  return response.choices[0].message.content;
};

export const gradeInterview = async (application: any, qa: any[]) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Grade this interview for a club member position. 
        Applicant: ${application.name}
        Activities: ${application.activities}
        Plan: ${application.plan}
        
        Interview Transcript:
        ${qa.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n')}
        
        Provide a score from 0 to 100 and a short feedback.
        Output MUST be in JSON format: { "score": number, "feedback": "string" }`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
};
