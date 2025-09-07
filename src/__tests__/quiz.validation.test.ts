import { generateQuizValidation, createQuizValidation, updateQuizValidation } from './quiz.validation';

describe('Quiz Validations', () => {
  describe('generateQuizValidation', () => {
    it('should pass with a valid request body', () => {
      const validBody = {
        academicLevel: 'hsc',
        subject: 'Math',
        language: 'english',
        questionType: 'mcq',
        difficulty: 'easy',
        questionCount: 10,
      };
      const result = generateQuizValidation.safeParse({ body: validBody });
      expect(result.success).toBe(true);
    });

    it('should fail with an invalid request body', () => {
      const invalidBody = {
        academicLevel: 'hsc',
        subject: 'Math',
        language: 'english',
        questionType: 'mcq',
        difficulty: 'easy',
      };
      const result = generateQuizValidation.safeParse({ body: invalidBody });
      expect(result.success).toBe(false);
    });
  });

  describe('createQuizValidation', () => {
    it('should pass with a valid request body', () => {
      const validBody = {
        title: 'Test Quiz',
        subject: 'Math',
        academicLevel: 'hsc',
        difficulty: 'easy',
        language: 'english',
        questions: [
          {
            question: 'What is 2+2?',
            type: 'mcq',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            explanation: 'Because it is.',
            points: 1,
            difficulty: 'easy',
          },
        ],
      };
      const result = createQuizValidation.safeParse({ body: validBody });
      expect(result.success).toBe(true);
    });

    it('should fail with an invalid request body', () => {
        const invalidBody = {
            title: 'Test Quiz',
        };
        const result = createQuizValidation.safeParse({ body: invalidBody });
        expect(result.success).toBe(false);
    });
  });

  describe('updateQuizValidation', () => {
    it('should pass with a valid request body', () => {
        const validBody = {
            title: 'Updated Test Quiz',
        };
        const result = updateQuizValidation.safeParse({ body: validBody });
        expect(result.success).toBe(true);
    });

    it('should fail with an invalid request body', () => {
        const invalidBody = {
            title: 123,
        };
        const result = updateQuizValidation.safeParse({ body: invalidBody });
        expect(result.success).toBe(false);
    });
  });
});
