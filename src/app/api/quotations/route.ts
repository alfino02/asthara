import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  getSupabaseMasterDatabase,
  saveSupabaseQuotation,
  deleteSupabaseQuotation,
} from '@/lib/supabase-service';
import {
  getMasterDatabase,
  saveQuotationToDb,
  deleteQuotationFromDb,
} from '@/lib/db';
import { INITIAL_MASTER_DB } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const data = await getSupabaseMasterDatabase();
      return NextResponse.json({ success: true, source: 'supabase', quotations: data?.quotations || [] });
    }

    try {
      const db = getMasterDatabase();
      return NextResponse.json({ success: true, source: 'sqlite', quotations: db.quotations });
    } catch {
      return NextResponse.json({ success: true, source: 'memory', quotations: INITIAL_MASTER_DB.quotations });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal memuat riwayat penawaran' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const record = await request.json();

    if (isSupabaseConfigured) {
      await saveSupabaseQuotation(record);
      const data = await getSupabaseMasterDatabase();
      return NextResponse.json({
        success: true,
        source: 'supabase',
        message: `Penawaran ${record.quoteId} berhasil disimpan ke Supabase!`,
        quotations: data?.quotations || [],
      });
    }

    try {
      const quotations = saveQuotationToDb(record);
      return NextResponse.json({
        success: true,
        source: 'sqlite',
        message: `Penawaran ${record.quoteId} berhasil disimpan ke SQLite!`,
        quotations,
      });
    } catch {
      return NextResponse.json({
        success: true,
        source: 'memory',
        message: `Penawaran ${record.quoteId} tersimpan.`,
        quotations: [record, ...INITIAL_MASTER_DB.quotations],
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal menyimpan penawaran' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get('quoteId');
    if (!quoteId) {
      return NextResponse.json({ success: false, message: 'quoteId diperlukan' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      await deleteSupabaseQuotation(quoteId);
      const data = await getSupabaseMasterDatabase();
      return NextResponse.json({
        success: true,
        source: 'supabase',
        message: `Penawaran ${quoteId} berhasil dihapus dari Supabase.`,
        quotations: data?.quotations || [],
      });
    }

    try {
      const quotations = deleteQuotationFromDb(quoteId);
      return NextResponse.json({
        success: true,
        source: 'sqlite',
        message: `Penawaran ${quoteId} berhasil dihapus.`,
        quotations,
      });
    } catch {
      return NextResponse.json({
        success: true,
        source: 'memory',
        message: `Penawaran ${quoteId} dihapus.`,
        quotations: INITIAL_MASTER_DB.quotations.filter((q) => q.quoteId !== quoteId),
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Gagal menghapus penawaran' },
      { status: 500 }
    );
  }
}
