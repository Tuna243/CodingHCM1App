import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/adminAuth';
import {
  readUniformCampaign,
  sanitizeUniformCampaign,
  writeUniformCampaign,
} from '@/lib/uniformServerStore';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(
      { campaign: await readUniformCampaign() },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Unable to read uniform campaign', error);
    return NextResponse.json({ error: 'Không thể tải dữ liệu đợt áo.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  if (!verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const campaign = sanitizeUniformCampaign(await request.json());
    await writeUniformCampaign(campaign);
    return NextResponse.json({ campaign });
  } catch (error) {
    console.error('Unable to save uniform campaign', error);
    return NextResponse.json({ error: 'Không thể lưu dữ liệu đợt áo.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as {
      code?: string;
      selectedSize?: string;
      extraQuantity?: number;
      received?: boolean;
    };
    if (!body.code) {
      return NextResponse.json({ error: 'Thiếu mã giáo viên.' }, { status: 400 });
    }

    const campaign = await readUniformCampaign();
    let found = false;
    const teachers = campaign.teachers.map((teacher) => {
      if (teacher.code !== body.code) return teacher;
      found = true;
      const next = { ...teacher };

      if (body.selectedSize !== undefined && campaign.isOpen) {
        next.selectedSize = body.selectedSize as typeof next.selectedSize;
      }
      if (body.extraQuantity !== undefined && campaign.isOpen) {
        next.extraQuantity = Math.max(0, Math.min(3, Number(body.extraQuantity) || 0));
      }
      if (
        body.received !== undefined &&
        (teacher.status === 'Đã có áo' || teacher.status === 'Đã nhận áo')
      ) {
        next.received = body.received;
        next.status = body.received ? 'Đã nhận áo' : 'Đã có áo';
      } else if (teacher.status !== 'Đã có áo' && teacher.status !== 'Đã nhận áo') {
        next.status = next.selectedSize || next.extraQuantity > 0 ? 'Đã đăng ký' : 'Chưa đăng ký';
      }
      return next;
    });

    if (!found) {
      return NextResponse.json({ error: 'Không tìm thấy giáo viên.' }, { status: 404 });
    }

    const nextCampaign = { ...campaign, teachers };
    await writeUniformCampaign(nextCampaign);
    return NextResponse.json({ campaign: nextCampaign });
  } catch (error) {
    console.error('Unable to update uniform receipt', error);
    return NextResponse.json({ error: 'Không thể cập nhật trạng thái áo.' }, { status: 500 });
  }
}
