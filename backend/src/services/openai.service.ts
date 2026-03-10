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
        content: `당신은 대학교 동아리 AI 면접관입니다.
        지원자 이름: ${context[0].name}
        활동 이력: ${context[0].activities}
        동아리 계획: ${context[0].plan}

        반드시 한국어로 질문하세요.
        대학생 수준에 맞는 친근하지만 진지한 어투로 질문하세요.
        한 번에 하나의 질문만 하세요.
        지원자의 활동 이력과 동아리 계획을 바탕으로 구체적으로 질문하세요.
        총 5개의 질문을 하세요.`,
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
        content: `다음은 동아리 지원자의 AI 면접 내용입니다. 채점해주세요.
        지원자: ${application.name}
        활동 이력: ${application.activities}
        동아리 계획: ${application.plan}

        면접 내용:
        ${qa.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join('\n')}

        0~100점 사이의 점수와 한국어로 간단한 피드백을 작성해주세요.
        반드시 JSON 형식으로만 응답하세요: { "score": number, "feedback": "string" }`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
};
