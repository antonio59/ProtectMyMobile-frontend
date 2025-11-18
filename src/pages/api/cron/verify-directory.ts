import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Supabase with Service Role for Admin access
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export const GET: APIRoute = async () => {
  if (!supabase) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Missing SUPABASE_SERVICE_ROLE_KEY. Cannot perform admin operations.' 
    }), { status: 500 });
  }

  try {
    // 1. Fetch Banks and Providers
    const { data: banks, error: banksError } = await supabase
      .from('banks')
      .select('id, name, website');
      
    const { data: providers, error: providersError } = await supabase
      .from('mobile_providers')
      .select('id, name, website');

    if (banksError || providersError) {
      throw new Error('Failed to fetch directory data');
    }

    const report = {
      checked: 0,
      active: 0,
      inactive: 0,
      details: [] as string[]
    };

    const checkUrl = async (url: string, name: string, table: 'banks' | 'mobile_providers', id: string) => {
      report.checked++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const response = await fetch(url, { 
          method: 'HEAD', 
          signal: controller.signal,
          headers: { 'User-Agent': 'ProtectMyMobile/1.0' }
        });
        clearTimeout(timeoutId);

        if (response.ok || response.status === 405) { // 405 Method Not Allowed is often returned for HEAD but implies server exists
          report.active++;
          // Update last_verified
          await supabase
            .from(table)
            .update({ last_verified: new Date().toISOString(), active: true })
            .eq('id', id);
        } else {
          report.inactive++;
          report.details.push(`❌ ${name} (${url}) returned ${response.status}`);
          // Optionally mark inactive, but maybe manual review is safer
          // await supabase.from(table).update({ active: false }).eq('id', id);
        }
      } catch (err: any) {
        report.inactive++;
        report.details.push(`❌ ${name} (${url}) failed: ${err.message}`);
      }
    };

    // Check in parallel batches
    const promises = [
      ...(banks || []).map(b => checkUrl(b.website, b.name, 'banks', b.id)),
      ...(providers || []).map(p => checkUrl(p.website, p.name, 'mobile_providers', p.id))
    ];

    await Promise.all(promises);

    // 2. Send Report via Resend
    const resendApiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'ProtectMyMobile <onboarding@resend.dev>',
          to: ['delivered@resend.dev'],
          subject: `Directory Verification Report: ${report.inactive} Issues Found`,
          html: `
            <h2>Directory Verification Status</h2>
            <p><strong>Checked:</strong> ${report.checked}</p>
            <p><strong>Active:</strong> <span style="color:green">${report.active}</span></p>
            <p><strong>Inactive/Issues:</strong> <span style="color:red">${report.inactive}</span></p>
            
            <h3>Issues Detail:</h3>
            <ul>
              ${report.details.length > 0 ? report.details.map(d => `<li>${d}</li>`).join('') : '<li>No issues found.</li>'}
            </ul>
            
            <p>Note: Automated check performed at ${new Date().toISOString()}.</p>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send email report:', emailErr);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        report 
      }), 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Directory verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }), 
      { status: 500 }
    );
  }
};
