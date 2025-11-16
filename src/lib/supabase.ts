import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://cusemqzwingcxipbcobe.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c2VtcXp3aW5nY3hpcGJjb2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODI0MDYsImV4cCI6MjA3ODY1ODQwNn0.VXO0_JDc34tcvJwBZsLGZS9vn6nqFHA6U_GGqoOOXys';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface NewsPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id?: string;
  author_name: string;
  category: 'arrest' | 'seizure' | 'law_change' | 'statistics' | 'prevention_tip' | 'other';
  source_url?: string;
  source_name?: string;
  featured_image_url?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TheftDataPoint {
  id: number;
  date: string;
  location_name: string;
  latitude: number;
  longitude: number;
  theft_count: number;
  data_source: string;
  created_at: string;
}

export interface MetPoliceRequest {
  id: number;
  request_date: string;
  request_type: 'foi_request' | 'data_update' | 'statistics';
  date_range_start: string;
  date_range_end: string;
  status: 'pending' | 'submitted' | 'received' | 'processed';
  request_details?: string;
  response_received_at?: string;
  response_notes?: string;
  created_by?: string;
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

// News/Blog Posts
export async function getNewsPosts(publishedOnly = true) {
  let query = supabase
    .from('news_posts')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  
  if (publishedOnly) {
    query = query.eq('published', true);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as NewsPost[];
}

export async function getNewsPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data as NewsPost;
}

export async function createNewsPost(post: Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('news_posts')
    .insert([post])
    .select()
    .single();
  
  if (error) throw error;
  return data as NewsPost;
}

export async function updateNewsPost(id: number, updates: Partial<NewsPost>) {
  const { data, error } = await supabase
    .from('news_posts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as NewsPost;
}

export async function publishNewsPost(id: number) {
  return updateNewsPost(id, {
    published: true,
    published_at: new Date().toISOString(),
  });
}

export async function deleteNewsPost(id: number) {
  const { error } = await supabase
    .from('news_posts')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Theft Data Points (for timelapse)
export async function getTheftDataPoints(startDate?: string, endDate?: string) {
  let query = supabase
    .from('theft_data_points')
    .select('*')
    .order('date', { ascending: true });
  
  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as TheftDataPoint[];
}

export async function createTheftDataPoints(dataPoints: Omit<TheftDataPoint, 'id' | 'created_at'>[]) {
  const { data, error } = await supabase
    .from('theft_data_points')
    .insert(dataPoints)
    .select();
  
  if (error) throw error;
  return data as TheftDataPoint[];
}

// Met Police Requests
export async function getMetPoliceRequests() {
  const { data, error } = await supabase
    .from('met_police_requests')
    .select('*')
    .order('request_date', { ascending: false });
  
  if (error) throw error;
  return data as MetPoliceRequest[];
}

export async function createMetPoliceRequest(request: Omit<MetPoliceRequest, 'id' | 'request_date' | 'created_at'>) {
  const user = await getCurrentUser();
  
  const { data, error } = await supabase
    .from('met_police_requests')
    .insert([{
      ...request,
      created_by: user?.id,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as MetPoliceRequest;
}

export async function updateMetPoliceRequest(id: number, updates: Partial<MetPoliceRequest>) {
  const { data, error } = await supabase
    .from('met_police_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as MetPoliceRequest;
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

// =====================================================
// BANKS & MOBILE PROVIDERS
// =====================================================

export interface Bank {
  id: string;
  name: string;
  phone: string | null;
  website: string;
  fraud_contact: string | null;
  category: 'high_street' | 'online' | 'building_society' | 'challenger';
  logo_url: string | null;
  active: boolean;
  last_verified: string | null;
  created_at: string;
  updated_at: string;
}

export interface MobileProvider {
  id: string;
  name: string;
  phone: string | null;
  website: string;
  theft_contact: string | null;
  network: 'EE' | 'Vodafone' | 'O2' | 'Three' | 'MVNO';
  is_mvno: boolean;
  parent_network: string | null;
  active: boolean;
  last_verified: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBanks() {
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .eq('active', true)
    .order('name');
  
  if (error) throw error;
  return data as Bank[];
}

export async function getMobileProviders() {
  const { data, error } = await supabase
    .from('mobile_providers')
    .select('*')
    .eq('active', true)
    .order('name');
  
  if (error) throw error;
  return data as MobileProvider[];
}
