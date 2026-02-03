import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({
                error: 'Missing environment variables',
                supabaseUrl: !!supabaseUrl,
                supabaseServiceKey: !!supabaseServiceKey
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Check users table
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('user_id, email, role, status, country')
            .limit(10);

        // Check auth users
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

        return NextResponse.json({
            usersTableCount: users?.length || 0,
            users: users,
            usersError: usersError?.message,
            authUsersCount: authData?.users?.length || 0,
            authUsers: authData?.users?.map(u => ({ id: u.id, email: u.email })) || [],
            authError: authError?.message
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
