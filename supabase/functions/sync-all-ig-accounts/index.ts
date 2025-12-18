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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting daily IG sync...');

    // Fetch all IG accounts
    const { data: accounts, error: fetchError } = await supabase
      .from('ig_accounts')
      .select('id, ig_username');

    if (fetchError) {
      console.error('Error fetching accounts:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${accounts?.length || 0} accounts to sync`);

    let successCount = 0;
    let failCount = 0;

    for (const account of accounts || []) {
      try {
        const cleanUsername = account.ig_username.replace(/^@/, '').trim();
        console.log(`Syncing @${cleanUsername}...`);

        // Fetch Instagram profile data
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
          console.error(`Failed to fetch @${cleanUsername}: ${response.status}`);
          failCount++;
          continue;
        }

        const data = await response.json();
        const user = data?.data?.user;

        if (user) {
          const followerCount = user.edge_followed_by?.count || 0;
          const avatarUrl = user.profile_pic_url_hd || user.profile_pic_url || null;

          // Update the account
          const { error: updateError } = await supabase
            .from('ig_accounts')
            .update({
              follower_count: followerCount,
              ig_avatar_url: avatarUrl,
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', account.id);

          if (updateError) {
            console.error(`Error updating @${cleanUsername}:`, updateError);
            failCount++;
          } else {
            console.log(`Successfully synced @${cleanUsername}: ${followerCount} followers`);
            successCount++;
          }
        } else {
          console.error(`No user data for @${cleanUsername}`);
          failCount++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Error syncing account ${account.id}:`, err);
        failCount++;
      }
    }

    // Log the sync result
    await supabase.from('system_logs').insert({
      action: 'daily_ig_sync',
      metadata: {
        total: accounts?.length || 0,
        success: successCount,
        failed: failCount,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Daily sync completed: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        total: accounts?.length || 0,
        synced: successCount,
        failed: failCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in daily sync:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
