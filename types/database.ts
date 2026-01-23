export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  resume_url?: string;
  cover_letter?: string;
  applied_at: string;
  updated_at: string;
}

export interface ApplicationWithJob extends Application {
  job_title: string;
  company: string;
  location: string;
}
