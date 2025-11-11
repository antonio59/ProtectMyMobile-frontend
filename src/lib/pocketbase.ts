import PocketBase from 'pocketbase';

// Initialize PocketBase client
const pb = new PocketBase(import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:8090');

// Enable auto cancellation for duplicate requests
pb.autoCancellation(false);

export default pb;

// Type definitions for our collections
export interface ImeiRecord {
  id: string;
  imeiNumber: string;
  deviceName: string;
  user?: string;
  created: string;
  updated: string;
}

export interface ExperienceReport {
  id: string;
  hasExperiencedTheft: boolean;
  when: string;
  where: string;
  whatHappened: string;
  doingDifferently?: string;
  name: string;
  email: string;
  approved: boolean;
  approvedAt?: string;
  created: string;
  updated: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  responded: boolean;
  responseMessage?: string;
  respondedAt?: string;
  created: string;
  updated: string;
}

export interface AdminAction {
  id: string;
  admin: string;
  actionType: 'approve_experience' | 'unapprove_experience' | 'respond_contact' | 'mark_spam';
  targetId: number;
  metadata?: any;
  created: string;
  updated: string;
}

// Helper functions
export const collections = {
  imei: 'imei_records',
  experiences: 'experience_reports',
  contacts: 'contact_submissions',
  adminActions: 'admin_actions',
};

// Authentication helpers
export async function login(username: string, password: string) {
  try {
    const authData = await pb.collection('users').authWithPassword(username, password);
    return authData;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export function logout() {
  pb.authStore.clear();
}

export function isAuthenticated() {
  return pb.authStore.isValid;
}

export function getCurrentUser() {
  return pb.authStore.model;
}

// IMEI Records
export async function getImeiRecords() {
  return await pb.collection(collections.imei).getFullList<ImeiRecord>({
    sort: '-created',
  });
}

export async function createImeiRecord(data: Omit<ImeiRecord, 'id' | 'created' | 'updated'>) {
  return await pb.collection(collections.imei).create<ImeiRecord>(data);
}

export async function deleteImeiRecord(id: string) {
  return await pb.collection(collections.imei).delete(id);
}

// Experience Reports
export async function getExperienceReports(approvedOnly = false) {
  const filter = approvedOnly ? 'approved = true' : '';
  return await pb.collection(collections.experiences).getFullList<ExperienceReport>({
    sort: '-created',
    filter,
  });
}

export async function createExperienceReport(data: Omit<ExperienceReport, 'id' | 'created' | 'updated' | 'approved' | 'approvedAt'>) {
  return await pb.collection(collections.experiences).create<ExperienceReport>(data);
}

export async function updateExperienceApproval(id: string, approved: boolean) {
  return await pb.collection(collections.experiences).update<ExperienceReport>(id, {
    approved,
    approvedAt: approved ? new Date().toISOString() : null,
  });
}

// Contact Submissions
export async function getContactSubmissions() {
  return await pb.collection(collections.contacts).getFullList<ContactSubmission>({
    sort: '-created',
  });
}

export async function createContactSubmission(data: Omit<ContactSubmission, 'id' | 'created' | 'updated' | 'responded' | 'responseMessage' | 'respondedAt'>) {
  return await pb.collection(collections.contacts).create<ContactSubmission>(data);
}

export async function updateContactResponse(id: string, responseMessage: string) {
  return await pb.collection(collections.contacts).update<ContactSubmission>(id, {
    responded: true,
    responseMessage,
    respondedAt: new Date().toISOString(),
  });
}

// Admin Actions
export async function createAdminAction(data: Omit<AdminAction, 'id' | 'created' | 'updated'>) {
  return await pb.collection(collections.adminActions).create<AdminAction>(data);
}

export async function getAdminActions() {
  return await pb.collection(collections.adminActions).getFullList<AdminAction>({
    sort: '-created',
  });
}
