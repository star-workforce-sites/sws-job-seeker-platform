-- Add 20 sample consulting/contract jobs
-- Run this in Neon SQL Editor: https://console.neon.tech

INSERT INTO jobs (title, description, location, industry, "employmentType", visa, "salaryMin", "salaryMax", "isActive", "createdAt", "expiresAt")
VALUES
-- Software Engineering
('Senior Software Engineer', 'Looking for a senior software engineer with 5+ years of experience in Java, Python, or Node.js. Must have experience with cloud platforms (AWS/Azure/GCP) and microservices architecture.', 'Remote - USA', 'Software', 'contract', true, 150000, 180000, true, NOW(), NOW() + INTERVAL '30 days'),

('Full Stack Developer', 'React/Node.js developer needed for a 6-month contract. Experience with TypeScript, PostgreSQL, and REST APIs required.', 'New York, NY (Hybrid)', 'Software', 'contract', true, 120000, 150000, true, NOW(), NOW() + INTERVAL '30 days'),

('Backend Engineer - Python', 'Python backend engineer for fintech startup. Experience with Django/FastAPI, PostgreSQL, and Redis. Remote-first company.', 'Remote - USA', 'Software', 'consulting', true, 140000, 170000, true, NOW(), NOW() + INTERVAL '30 days'),

-- Cloud & DevOps
('Cloud Architect - AWS', 'AWS Solutions Architect needed for enterprise cloud migration project. Must have AWS certifications and experience with Terraform.', 'San Francisco, CA (Hybrid)', 'Cloud', 'consulting', true, 180000, 220000, true, NOW(), NOW() + INTERVAL '30 days'),

('DevOps Engineer', 'DevOps engineer with Kubernetes, Docker, and CI/CD pipeline experience. Jenkins, GitHub Actions, or GitLab CI preferred.', 'Austin, TX (Remote)', 'DevOps', 'contract', true, 130000, 160000, true, NOW(), NOW() + INTERVAL '30 days'),

('Site Reliability Engineer', 'SRE needed for high-traffic e-commerce platform. Experience with monitoring tools (Datadog, Prometheus) and incident management.', 'Seattle, WA (Hybrid)', 'DevOps', 'contract', true, 150000, 180000, true, NOW(), NOW() + INTERVAL '30 days'),

-- AI/ML
('Machine Learning Engineer', 'ML Engineer for computer vision project. Experience with PyTorch, TensorFlow, and deploying ML models at scale.', 'Remote - USA', 'AI/ML', 'consulting', true, 170000, 210000, true, NOW(), NOW() + INTERVAL '30 days'),

('Data Scientist', 'Data scientist for healthcare analytics. Python, SQL, and experience with statistical modeling required. PhD preferred.', 'Boston, MA (Hybrid)', 'AI/ML', 'contract', true, 140000, 175000, true, NOW(), NOW() + INTERVAL '30 days'),

('AI Research Engineer', 'AI research engineer for NLP project. Experience with transformers, BERT/GPT models, and LangChain preferred.', 'Remote - USA', 'AI/ML', 'consulting', true, 180000, 230000, true, NOW(), NOW() + INTERVAL '30 days'),

-- Cybersecurity
('Security Engineer', 'Security engineer for SOC team. Experience with SIEM tools, threat detection, and incident response.', 'Washington, DC (Onsite)', 'Cybersecurity', 'contract', true, 140000, 170000, true, NOW(), NOW() + INTERVAL '30 days'),

('Cloud Security Architect', 'Cloud security architect for multi-cloud environment. CISSP certification and experience with AWS/Azure security services.', 'Chicago, IL (Hybrid)', 'Cybersecurity', 'consulting', true, 175000, 210000, true, NOW(), NOW() + INTERVAL '30 days'),

('Penetration Tester', 'Penetration tester for financial services client. OSCP certification required. Experience with web and mobile app testing.', 'Remote - USA', 'Cybersecurity', 'contract', true, 130000, 160000, true, NOW(), NOW() + INTERVAL '30 days'),

-- Data Engineering
('Data Engineer', 'Data engineer for building data pipelines. Experience with Spark, Airflow, and cloud data warehouses (Snowflake/BigQuery).', 'Denver, CO (Remote)', 'Data Engineering', 'contract', true, 140000, 170000, true, NOW(), NOW() + INTERVAL '30 days'),

('ETL Developer', 'ETL developer for data integration project. Experience with Informatica, Talend, or custom Python ETL pipelines.', 'Dallas, TX (Hybrid)', 'Data Engineering', 'consulting', true, 120000, 150000, true, NOW(), NOW() + INTERVAL '30 days'),

('Analytics Engineer', 'Analytics engineer with dbt experience. Build and maintain data models for business intelligence team.', 'Remote - USA', 'Data Engineering', 'contract', true, 130000, 160000, true, NOW(), NOW() + INTERVAL '30 days'),

-- Mobile Development
('iOS Developer', 'Senior iOS developer with Swift experience. Building financial services mobile app. 6-month contract with extension possible.', 'San Francisco, CA (Hybrid)', 'Mobile', 'contract', true, 150000, 180000, true, NOW(), NOW() + INTERVAL '30 days'),

('Android Developer', 'Android developer for e-commerce app. Kotlin, Jetpack Compose, and experience with REST APIs required.', 'Remote - USA', 'Mobile', 'contract', true, 140000, 170000, true, NOW(), NOW() + INTERVAL '30 days'),

-- Project/Product
('Technical Project Manager', 'Technical PM for enterprise software implementation. PMP certification and Agile experience required.', 'Atlanta, GA (Hybrid)', 'Project Management', 'consulting', true, 130000, 160000, true, NOW(), NOW() + INTERVAL '30 days'),

('Scrum Master', 'Scrum Master for multiple agile teams. CSM certification and experience with Jira/Confluence required.', 'Remote - USA', 'Project Management', 'contract', true, 110000, 140000, true, NOW(), NOW() + INTERVAL '30 days'),

('Product Manager - Tech', 'Product Manager for B2B SaaS platform. Experience with product roadmap, user research, and working with engineering teams.', 'New York, NY (Hybrid)', 'Product', 'consulting', true, 150000, 180000, true, NOW(), NOW() + INTERVAL '30 days')

ON CONFLICT DO NOTHING;

-- Verify jobs were added
SELECT COUNT(*) as total_jobs FROM jobs WHERE "isActive" = true;
