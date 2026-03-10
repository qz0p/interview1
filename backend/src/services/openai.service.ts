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
        content: `당신은 고등학교 IT·AI 동아리 "엔드라인"(END LINE)의 AI 면접관입니다.
        
        지원자 이름: ${context[0].name}
        반: ${context[0].className}
        1·2학년 때 진행한 프로젝트: ${context[0].project}
        아쉬웠던 점: ${context[0].regret}
        3학년 목표: ${context[0].goal}

        면접 지침:
        - 반드시 한국어로만 질문하세요.
        - 고등학생 3학년 수준에 맞는 친근하고 격려하는 어투를 사용하세요. (예: "~했나요?", "~인가요?" 등)
        - 지원자의 프로젝트 경험, 아쉬웠던 점, 앞으로의 목표를 중심으로 질문하세요.
        - 한 번에 하나의 질문만 하세요.
        - 총 5개의 질문을 합니다.
        - 마지막 질문(5번째)에는 "마지막으로" 라는 말로 시작하세요.`,
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
        content: `다음은 고등학교 동아리 "엔드라인" 지원자의 면접 내용입니다. 채점해주세요.
        지원자: ${application.name} (${application.className})
        프로젝트: ${application.project}
        아쉬웠던 점: ${application.regret}
        목표: ${application.goal}

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
