import { NextRequest, NextResponse } from 'next/server';
import { wxPaySign } from '@/lib/utils/ltpaysign';

// 新增的路由处理函数
// export async function POST(
//   req: NextRequest,
//   { params }: { params: { slug: string[] } }
// ) {
//   const slug = params.slug?.[0];

//   if (slug === 'get_pay_order') {
//     // 查询订单
//     return handleGetPayOrder(req);
//   } else if (slug === 'get_wx_qrcode') {
//     // 获取微信支付二维码
//     return handleGetWXQRCode(req);
//   }

//   // 原有的处理逻辑
//   return handleOriginalPost(req);
// }

export async function POST(req: NextRequest) {
  console.log("----------POST");
  try {
    const { out_trade_no, total_fee, body } = await req.json();
    
    const mch_id = process.env.MCH_ID;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const notify_url = process.env.NOTIFY_URL;
    const mch_key = process.env.MCH_KEY;

    const sign = wxPaySign({
      mch_id,
      out_trade_no,
      total_fee,
      body,
      timestamp,
      notify_url
    }, mch_key);

    const formBody = new URLSearchParams({
      mch_id: mch_id?.toString() ?? '',
      out_trade_no: out_trade_no?.toString() ?? '',
      total_fee: total_fee?.toString() ?? '',
      body: body?.toString() ?? '',
      timestamp: timestamp?.toString() ?? '',
      notify_url: notify_url?.toString() ?? '',
      sign: sign?.toString() ?? '',
      attach: '{"product_type":0}',
    }).toString();

    const response = await fetch('https://api.ltzf.cn/api/wxpay/native', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('请求失败:', error);
    return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
  }
}




// async function handleOriginalPost(req: NextRequest) {
//   // 将原有的 POST 处理逻辑移到这个函数中
//   // ... 原有的代码 ...
// }

