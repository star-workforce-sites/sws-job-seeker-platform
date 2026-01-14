-- Interview Prep Tables
-- Questions are stored by skill/topic for reuse
-- Sessions track user attempts and scores

-- Table to store reusable interview questions
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(skill, topic, question)
);

-- Table to store user interview sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  "jobDescription" TEXT NOT NULL,
  skills JSONB NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2),
  completed BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "completedAt" TIMESTAMP WITH TIME ZONE
);

-- Table to store user answers per session
CREATE TABLE IF NOT EXISTS interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionId" UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
  "questionId" UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  "answeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_interview_questions_skill ON interview_questions(skill);
CREATE INDEX IF NOT EXISTS idx_interview_questions_topic ON interview_questions(topic);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_email ON interview_sessions(email);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session ON interview_answers("sessionId");

-- Seed with initial questions (cloud computing, data engineering examples)
INSERT INTO interview_questions (skill, topic, difficulty, question, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES
('Cloud Computing', 'AWS', 'intermediate', 'What is the primary purpose of AWS Lambda?', 'Virtual machine management', 'Serverless code execution', 'Database hosting', 'Content delivery', 'B', 'AWS Lambda allows you to run code without provisioning or managing servers, making it ideal for serverless architectures.'),
('Cloud Computing', 'AWS', 'intermediate', 'Which AWS service provides a managed Kubernetes service?', 'ECS', 'EKS', 'Fargate', 'Elastic Beanstalk', 'B', 'Amazon EKS (Elastic Kubernetes Service) is AWS''s managed Kubernetes service.'),
('Data Engineering', 'ETL', 'intermediate', 'What does ETL stand for?', 'Extract, Transform, Load', 'Evaluate, Test, Launch', 'Encode, Transfer, Link', 'Execute, Track, Log', 'A', 'ETL is a data integration process that Extracts data from sources, Transforms it, and Loads it into a target system.'),
('Data Engineering', 'Data Warehousing', 'intermediate', 'Which is NOT a characteristic of a data warehouse?', 'Subject-oriented', 'Time-variant', 'Real-time processing', 'Non-volatile', 'C', 'Data warehouses are designed for batch processing and historical analysis, not real-time processing.'),
('Software Engineering', 'System Design', 'advanced', 'What pattern is best for handling high traffic spikes?', 'Monolithic architecture', 'Load balancing with auto-scaling', 'Single server optimization', 'Database replication only', 'B', 'Load balancing with auto-scaling distributes traffic across multiple servers and automatically scales based on demand.')
ON CONFLICT (skill, topic, question) DO NOTHING;
