import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://cusemqzwingcxipbcobe.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c2VtcXp3aW5nY3hpcGJjb2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODI0MDYsImV4cCI6MjA3ODY1ODQwNn0.VXO0_JDc34tcvJwBZsLGZS9vn6nqFHA6U_GGqoOOXys';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface ImeiRecord {
  id: number;
  imei_number: string;
  device_name: string;
  user_id?: string;
  created_at: string;
}

export interface ExperienceReport {
  id: number;
  has_experienced_theft: boolean;
  when: string;  // Note: column name is "when" in quotes in DB
  where: string;  // Note: column name is "where" in quotes in DB
  what_happened: string;
  doing_differently?: string;
  name: string;
  email: string;
  approved: boolean;
  approved_at?: string;
  created_at: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  responded: boolean;
  response_message?: string;
  responded_at?: string;
  created_at: string;
}

export interface AdminAction {
  id: number;
  admin_id: string;
  admin_username: string;
  action_type: 'approve_experience' | 'unapprove_experience' | 'respond_contact' | 'mark_spam';
  target_id: number;
  metadata?: string;
  created_at: string;
}

// Authentication helpers
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function isAuthenticated() {
  return supabase.auth.getSession().then(({ data }) => !!data.session);
}

// IMEI Records
export async function getImeiRecords() {
  const { data, error } = await supabase
    .from('imei_records')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as ImeiRecord[];
}

export async function createImeiRecord(record: Omit<ImeiRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('imei_records')
    .insert([record])
    .select()
    .single();
  
  if (error) throw error;
  return data as ImeiRecord;
}

export async function deleteImeiRecord(id: number) {
  const { error } = await supabase
    .from('imei_records')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Experience Reports
export async function getExperienceReports(approvedOnly = false) {
  let query = supabase
    .from('experience_reports')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (approvedOnly) {
    query = query.eq('approved', true);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as ExperienceReport[];
}

export async function createExperienceReport(report: Omit<ExperienceReport, 'id' | 'created_at' | 'approved' | 'approved_at'>) {
  const { data, error } = await supabase
    .from('experience_reports')
    .insert([report])
    .select()
    .single();
  
  if (error) throw error;
  return data as ExperienceReport;
}

export async function updateExperienceApproval(id: number, approved: boolean) {
  const { data, error } = await supabase
    .from('experience_reports')
    .update({
      approved,
      approved_at: approved ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ExperienceReport;
}

// Contact Submissions
export async function getContactSubmissions() {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as ContactSubmission[];
}

export async function createContactSubmission(submission: Omit<ContactSubmission, 'id' | 'created_at' | 'responded' | 'response_message' | 'responded_at'>) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert([submission])
    .select()
    .single();
  
  if (error) throw error;
  return data as ContactSubmission;
}

export async function updateContactResponse(id: number, responseMessage: string) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .update({
      responded: true,
      response_message: responseMessage,
      responded_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ContactSubmission;
}

// Admin Actions
export async function createAdminAction(action: Omit<AdminAction, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('admin_action_history')
    .insert([action])
    .select()
    .single();
  
  if (error) throw error;
  return data as AdminAction;
}

export async function getAdminActions() {
  const { data, error } = await supabase
    .from('admin_action_history')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as AdminAction[];
}
