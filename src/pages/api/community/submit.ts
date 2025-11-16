// API Endpoint: POST /api/community/submit
// Handles community response submissions

import type { APIRoute } from 'astro';
import { submitCommunityResponse, hashIP } from '../../../lib/communityData';
import type { CommunityResponse } from '../../../lib/communityData';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.had_phone_stolen) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing required field: had_phone_stolen' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.session_id) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Missing session ID' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate conditional fields
    if (body.had_phone_stolen === 'yes') {
      if (!body.phone_recovered || !body.theft_location) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Missing required fields for theft victims' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Get client IP for rate limiting (hashed for privacy)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const ipHash = clientIP !== 'unknown' ? await hashIP(clientIP) : undefined;

    // Prepare response object
    const response: CommunityResponse = {
      had_phone_stolen: body.had_phone_stolen,
      phone_recovered: body.phone_recovered || null,
      replacement_method: body.replacement_method || null,
      theft_location: body.theft_location || null,
      security_measures: body.security_measures || [],
      reported_to_police: body.reported_to_police || null,
    };

    // Submit to database
    const result = await submitCommunityResponse(
      response,
      body.session_id,
      ipHash
    );

    if (!result.success) {
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Response submitted successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in submit API:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
