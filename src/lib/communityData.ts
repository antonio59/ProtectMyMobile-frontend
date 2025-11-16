// Community Analytics - Data Management Functions
// Handles vote submissions and analytics retrieval

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Community features will not work.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ============================================
// TypeScript Interfaces
// ============================================

export interface CommunityResponse {
  id?: string;
  had_phone_stolen: 'yes' | 'no' | 'someone_i_know';
  phone_recovered?: 'yes_fully' | 'partially' | 'no' | 'investigating' | null;
  replacement_method?: 'new_outright' | 'second_hand' | 'insurance' | 'contract' | 'not_yet' | 'backup_phone' | null;
  theft_location?: 'public_transport' | 'restaurant' | 'street' | 'event' | 'shop' | 'other' | null;
  security_measures?: string[];
  reported_to_police?: 'yes_crime_ref' | 'yes_no_followup' | 'no' | 'network_only' | null;
  session_id?: string;
  submitted_at?: string;
}

export interface CommunityStats {
  totalResponses: number;
  totalStolen: number;
  neverStolen: number;
  someoneIKnow: number;
  
  recoveryStats: {
    fullyRecovered: number;
    partiallyRecovered: number;
    notRecovered: number;
    investigating: number;
    recoveryRate: number;
  };
  
  locationStats: {
    publicTransport: number;
    restaurant: number;
    street: number;
    event: number;
    shop: number;
    other: number;
  };
  
  replacementStats: {
    newOutright: number;
    secondHand: number;
    insurance: number;
    contract: number;
    notYet: number;
    backupPhone: number;
  };
  
  securityStats: {
    usingPin: number;
    usingBiometric: number;
    usingFindMyDevice: number;
    usingSimPin: number;
    noSecurity: number;
  };
  
  policeStats: {
    yesCrimeRef: number;
    yesNoFollowup: number;
    no: number;
    networkOnly: number;
    reportingRate: number;
  };
  
  lastUpdated: string;
}

// ============================================
// Data Functions
// ============================================

/**
 * Get community analytics statistics
 */
export async function getCommunityStats(): Promise<CommunityStats | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('get_community_stats');
    
    if (error) {
      console.error('Error fetching community stats:', error);
      return null;
    }
    
    return data as CommunityStats;
  } catch (err) {
    console.error('Exception fetching community stats:', err);
    return null;
  }
}

/**
 * Submit a new community response
 */
export async function submitCommunityResponse(
  response: CommunityResponse,
  sessionId: string,
  ipHash?: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    // Check if session has already voted
    const { data: hasVoted } = await supabase.rpc('has_voted', { 
      session_uuid: sessionId 
    });
    
    if (hasVoted) {
      return { success: false, error: 'You have already submitted a response' };
    }

    // Insert response
    const { error } = await supabase
      .from('community_responses')
      .insert({
        ...response,
        session_id: sessionId,
        user_ip_hash: ipHash,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      });

    if (error) {
      console.error('Error submitting response:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Exception submitting response:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Check if session has already voted
 */
export async function checkHasVoted(sessionId: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { data } = await supabase.rpc('has_voted', { 
      session_uuid: sessionId 
    });
    return data || false;
  } catch (err) {
    console.error('Error checking vote status:', err);
    return false;
  }
}

/**
 * Generate a session ID (stored in localStorage)
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const storageKey = 'pmp_community_session';
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

/**
 * Hash IP address for privacy (client-side - basic hashing)
 * Note: For production, do this server-side with proper salt
 */
export async function hashIP(ip: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return ''; // Fallback for environments without crypto
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ============================================
// Helper Functions for Insights
// ============================================

/**
 * Generate personalized insights based on user's response
 */
export function generateInsights(
  userResponse: CommunityResponse,
  stats: CommunityStats
): string[] {
  const insights: string[] = [];
  
  if (userResponse.had_phone_stolen === 'yes') {
    // Recovery insights
    if (userResponse.phone_recovered === 'no') {
      const notRecoveredPercent = Math.round(
        (stats.recoveryStats.notRecovered / 
         (stats.recoveryStats.fullyRecovered + stats.recoveryStats.partiallyRecovered + stats.recoveryStats.notRecovered)) * 100
      );
      insights.push(`${notRecoveredPercent}% of theft victims in our community also never recovered their phone.`);
    }
    
    // Security insights
    if (userResponse.security_measures?.includes('find_my_device')) {
      insights.push('Find My Device significantly increases recovery chances. Keep it enabled!');
    } else {
      insights.push('Consider enabling Find My Device - users with this feature have higher recovery rates.');
    }
    
    // Location insights
    if (userResponse.theft_location === 'public_transport') {
      insights.push('Public transport is the most common theft location in our data. Stay extra vigilant on buses and trains.');
    }
    
    // Police reporting
    if (userResponse.reported_to_police === 'yes_crime_ref') {
      insights.push('Good! Reporting to police creates official records that may help with insurance claims.');
    } else if (userResponse.reported_to_police === 'no') {
      insights.push('Consider reporting to police even if recovery seems unlikely - it helps track crime patterns.');
    }
  } else {
    // Prevention insights for those who haven\'t been victims
    if (userResponse.security_measures?.includes('biometric') && 
        userResponse.security_measures?.includes('find_my_device')) {
      insights.push('Excellent security setup! You\'re well-protected against theft.');
    } else {
      insights.push('Consider adding more security layers like biometric locks and Find My Device.');
    }
  }
  
  return insights;
}

/**
 * Get the most common theft location
 */
export function getMostCommonLocation(stats: CommunityStats): string {
  const locations = stats.locationStats;
  const max = Math.max(
    locations.publicTransport,
    locations.restaurant,
    locations.street,
    locations.event,
    locations.shop,
    locations.other
  );
  
  if (max === locations.publicTransport) return 'Public Transport';
  if (max === locations.street) return 'Street';
  if (max === locations.restaurant) return 'Restaurant/Café';
  if (max === locations.event) return 'Event/Venue';
  if (max === locations.shop) return 'Shop/Mall';
  return 'Other';
}

/**
 * Calculate security adoption percentage
 */
export function getSecurityAdoptionRate(stats: CommunityStats): number {
  const total = stats.totalResponses;
  const withSecurity = total - stats.securityStats.noSecurity;
  return Math.round((withSecurity / total) * 100);
}
