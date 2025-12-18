import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, accountId } = await req.json();

    if (!username) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '').trim();
    
    console.log('Fetching IG data for:', cleanUsername);

    // Try to fetch Instagram profile data using Instagram's web API
    const profileUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-IG-App-ID': '936619743392459',
      },
    });

    if (!response.ok) {
      console.error('Instagram API error:', response.status);
      
      // Fallback: try scraping the public profile page
      const fallbackUrl = `https://www.instagram.com/${cleanUsername}/?__a=1&__d=dis`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!fallbackResponse.ok) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Unable to fetch Instagram data. The profile may be private or the username is incorrect.',
            followerCount: 0,
            avatarUrl: null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let followerCount = 0;
    let avatarUrl = null;

    try {
      const data = await response.json();
      const user = data?.data?.user;
      
      if (user) {
        followerCount = user.edge_followed_by?.count || 0;
        avatarUrl = user.profile_pic_url_hd || user.profile_pic_url || null;
      }
    } catch (parseError) {
      console.error('Error parsing Instagram response:', parseError);
    }

    // If we have an accountId, update the database
    if (accountId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('ig_accounts')
        .update({
          follower_count: followerCount,
          ig_avatar_url: avatarUrl,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', accountId);

      if (updateError) {
        console.error('Error updating account:', updateError);
      }
    }

    console.log('Successfully fetched IG data:', { followerCount, avatarUrl: avatarUrl ? 'present' : 'null' });

    return new Response(
      JSON.stringify({
        success: true,
        followerCount,
        avatarUrl,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching IG data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch Instagram data',
        followerCount: 0,
        avatarUrl: null
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
