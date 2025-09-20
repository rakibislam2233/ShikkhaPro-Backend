import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import {
  AcademicLevel,
  Question,
  QuestionType,
  QuizDifficulty,
  QuizLanguage,
  IGenerateQuizRequest,
} from '../models/quiz/quiz.interface';
import AppError from '../errors/AppErro';
import { StatusCodes } from 'http-status-codes';

let geminiClient: GoogleGenerativeAI | null = null;

const initializeGemini = (): GoogleGenerativeAI => {
  if (!geminiClient) {
    if (!config.gemini?.apiKey) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Gemini API key is required');
    }

    geminiClient = new GoogleGenerativeAI(config.gemini.apiKey);
  }
  return geminiClient;
};

const getSystemPrompt = (): string => {
  return `You are an expert educator and quiz creator. Your task is to generate high-quality educational quiz questions based on the given parameters.

IMPORTANT INSTRUCTIONS:
1. Always respond with valid JSON format
2. Create questions that are educationally sound and appropriate for the specified academic level
3. Ensure questions test understanding, not just memorization
4. Make explanations clear and educational
5. For MCQ questions, provide 4 options with only one correct answer
6. For multiple-select questions, provide 4-6 options with 2-3 correct answers
7. For true-false questions, provide exactly 2 options: "True" and "False"
8. For short-answer questions, don't provide options
9. Use the specified language throughout
10. Ensure questions are culturally appropriate and inclusive

Response Format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "mcq|short-answer|true-false|multiple-select",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Only for mcq, multiple-select, true-false
      "correctAnswer": "Correct answer" | ["Answer 1", "Answer 2"], // String for single answer, array for multiple
      "explanation": "Detailed explanation of why this is the correct answer",
      "difficulty": "easy|medium|hard",
      "points": 1,
      "category": "Category name",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
};

const buildPrompt = (request: IGenerateQuizRequest): string => {
  const {
    academicLevel,
    subject,
    topic,
    language,
    questionType,
    difficulty,
    questionCount,
    instructions,
  } = request;

  let prompt = `Generate ${questionCount} ${questionType} quiz questions with the following specifications:

Academic Level: ${formatAcademicLevel(academicLevel)}
Subject: ${subject}
Topic: ${topic}
Language: ${language}
Question Type: ${questionType}
Difficulty: ${difficulty}
Question Count: ${questionCount}`;

  if (instructions) {
    prompt += `\nSpecial Instructions: ${instructions}`;
  }

  if (language === 'bengali') {
    prompt +=
      '\n\nPlease generate all questions, options, and explanations in Bengali language (বাংলা).';
  } else if (language === 'hindi') {
    prompt +=
      '\n\nPlease generate all questions, options, and explanations in Hindi language (हिंदी).';
  }

  prompt += `\n\nGuidelines for ${difficulty} difficulty:`;

  switch (difficulty) {
    case 'easy':
      prompt +=
        '\n- Focus on basic concepts and direct recall\n- Use simple language and clear questions\n- Test fundamental understanding';
      break;
    case 'medium':
      prompt +=
        '\n- Include application of concepts\n- May require some analysis or reasoning\n- Connect different ideas within the topic';
      break;
    case 'hard':
      prompt +=
        '\n- Require critical thinking and analysis\n- May involve complex scenarios or problem-solving\n- Test deep understanding and application';
      break;
  }

  if (questionType === 'mixed') {
    prompt +=
      '\n\nFor mixed type questions, create a variety including MCQ, short-answer, true-false, and multiple-select questions.';
  }

  return prompt;
};

const formatAcademicLevel = (level: AcademicLevel): string => {
  const levelMap: Record<AcademicLevel, string> = {
    // Pre-Primary & Primary Education
    'playgroup': 'Playgroup (Age 3-4)',
    'nursery': 'Nursery (Age 4-5)',
    'kg': 'Kindergarten (Age 5-6)',
    'class-1': 'Class 1 (Age 6-7)',
    'class-2': 'Class 2 (Age 7-8)',
    'class-3': 'Class 3 (Age 8-9)',
    'class-4': 'Class 4 (Age 9-10)',
    'class-5': 'Class 5 (Age 10-11)',

    // Secondary Education
    'class-6': 'Class 6 (Age 11-12)',
    'class-7': 'Class 7 (Age 12-13)',
    'class-8': 'Class 8 (Age 13-14)',
    'jsc': 'Junior School Certificate - JSC (Age 14)',
    'class-9': 'Class 9 (Age 14-15)',
    'class-10': 'Class 10 (Age 15-16)',
    'ssc': 'Secondary School Certificate - SSC (Age 16)',

    // Higher Secondary Education
    'class-11': 'Class 11 (Age 16-17)',
    'class-12': 'Class 12 (Age 17-18)',
    'hsc': 'Higher Secondary Certificate - HSC (Age 18)',

    // Undergraduate Education
    'bachelor': 'Bachelor\'s Degree (General)',
    'bsc': 'Bachelor of Science (BSc)',
    'ba': 'Bachelor of Arts (BA)',
    'bcom': 'Bachelor of Commerce (BCom)',
    'bba': 'Bachelor of Business Administration (BBA)',
    'btech': 'Bachelor of Technology (BTech)',
    'beng': 'Bachelor of Engineering (BEng)',

    // Postgraduate Education
    'master': 'Master\'s Degree (General)',
    'msc': 'Master of Science (MSc)',
    'ma': 'Master of Arts (MA)',
    'mcom': 'Master of Commerce (MCom)',
    'mba': 'Master of Business Administration (MBA)',
    'mtech': 'Master of Technology (MTech)',
    'meng': 'Master of Engineering (MEng)',

    // Professional & Competitive Exams
    'bcs': 'Bangladesh Civil Service (BCS)',
    'bank-job': 'Bank Job Preparation',
    'medical': 'Medical Entrance Exams',
    'engineering': 'Engineering Entrance Exams',
    'university': 'University Admission Tests',
    'ielts': 'IELTS Preparation',
    'toefl': 'TOEFL Preparation',
    'gre': 'GRE Preparation',
    'sat': 'SAT Preparation',

    // Professional Development
    'professional': 'Professional Development',
    'skill-development': 'Skill Development',
    'certification': 'Professional Certifications',
    'adult-learning': 'Adult Learning Programs',
    'general': 'General Knowledge/Mixed Level',
  };

  return levelMap[level] || level;
};

const formatQuestions = (
  questions: any[],
  request: IGenerateQuizRequest
): Question[] => {
  return questions.map((q, index) => ({
    id: `q_${Date.now()}_${index}`,
    question: q.question,
    type:
      q.type === 'mixed'
        ? getRandomQuestionType()
        : q.type || request.questionType,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty || request.difficulty,
    points: q.points || 1,
    category: q.category || request.topic,
    tags: q.tags || [request.subject, request.topic],
  }));
};

const getRandomQuestionType = (): QuestionType => {
  const types: QuestionType[] = [
    'mcq',
    'short-answer',
    'true-false',
    'multiple-select',
  ];
  return types[Math.floor(Math.random() * types.length)];
};

const geminiGenerateQuiz = async (
  request: IGenerateQuizRequest
): Promise<Question[]> => {
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = getSystemPrompt();
    const prompt = buildPrompt(request);

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    console.log('Gemini Response: ', responseText);

    if (!responseText) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'No response from Gemini');
    }

    // Clean the response text to extract JSON
    let cleanedResponse = responseText.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const generatedData = JSON.parse(cleanedResponse);
    return formatQuestions(generatedData.questions, request);
  } catch (error) {
    console.error('Error generating quiz with Gemini:', error);
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to generate quiz questions');
  }
};

const geminiGenerateSingleQuestion = async (
  subject: string,
  topic: string,
  academicLevel: AcademicLevel,
  difficulty: QuizDifficulty,
  questionType: QuestionType,
  language: QuizLanguage = 'english'
): Promise<Question> => {
  const questions = await geminiGenerateQuiz({
    academicLevel,
    subject,
    topic,
    language,
    questionType,
    difficulty,
    questionCount: 1,
  });

  return questions[0];
};

const geminiImproveQuestion = async (
  question: Question,
  feedback: string
): Promise<Question> => {
  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = getSystemPrompt();
    const prompt = `Improve the following quiz question based on the feedback provided:

Original Question:
${JSON.stringify(question, null, 2)}

Feedback: ${feedback}

Please provide an improved version of the question maintaining the same structure and format.`;

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'No response from Gemini');
    }

    // Clean the response text to extract JSON
    let cleanedResponse = responseText.trim();

    // Remove markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const improvedData = JSON.parse(cleanedResponse);
    return {
      ...question,
      ...improvedData.questions[0],
      id: question.id, // Keep original ID
    };
  } catch (error) {
    console.error('Error improving question with Gemini:', error);
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to improve question');
  }
};

export const GeminiService = {
  geminiGenerateQuiz,
  geminiGenerateSingleQuestion,
  geminiImproveQuestion,
};