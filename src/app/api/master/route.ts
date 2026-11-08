import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getSupabaseMasterDatabase, seedSupabaseDatabase } from '@/lib/supabase-service';
import {
  getMasterDatabase,
  updateMasterTables,
  resetMasterDatabaseToDefault,
} from '@/lib/db';
import { INITIAL_MASTER_DB } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const data = await getSupabaseMasterDatabase();
      if (data) {
        return NextResponse.json({ success: true, source: 'supabase', data });
      }
    }

    try {
      const data = getMasterDatabase();
      return NextResponse.json({ success: true, source: 'sqlite', data });
    } catch (sqliteErr) {
      console.warn('SQLite fallback to initial memory data:', sqliteErr);
      return NextResponse.json({ success: true, source: 'memory', data: INITIAL_MASTER_DB });
    }
  } catch (error: any) {
    console.error('Error GET /api/master:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memuat database master' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (isSupabaseConfigured) {
      await seedSupabaseDatabase(body);
      return NextResponse.json({
        success: true,
        source: 'supabase',
        message: 'Data master berhasil disimpan ke Supabase PostgreSQL.',
        data: body,
      });
    }

    const updated = updateMasterTables(body);
    return NextResponse.json({
      success: true,
      source: 'sqlite',
      message: 'Data master berhasil diperbarui ke database SQLite.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error PUT /api/master:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal menyimpan perubahan database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === 'reset') {
      if (isSupabaseConfigured) {
        await seedSupabaseDatabase(INITIAL_MASTER_DB);
        return NextResponse.json({
          success: true,
          source: 'supabase',
          message: 'Database Supabase berhasil di-reset ke standar Excel.',
          data: INITIAL_MASTER_DB,
        });
      }

      const resetData = resetMasterDatabaseToDefault();
      return NextResponse.json({
        success: true,
        source: 'sqlite',
        message: 'Database SQLite berhasil dikembalikan ke data awal Excel.',
        data: resetData,
      });
    }
    return NextResponse.json({ success: false, message: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (error: any) {
    console.error('Error POST /api/master:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal mereset database' },
      { status: 500 }
    );
  }
}
