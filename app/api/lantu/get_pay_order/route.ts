import { NextRequest, NextResponse } from 'next/server';
import { wxPaySign } from '@/lib/utils/ltpaysign';

export async function POST(req: NextRequest) {
    try {
      // 在这里实现 get_pay_order 的逻辑
      const { out_trade_no } = await req.json();
  
      // 示例：查询订单状态的逻辑
      const mch_id = process.env.MCH_ID;
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const mch_key = process.env.MCH_KEY;
  
      const sign = wxPaySign({
        mch_id,
        out_trade_no,
        timestamp,
      }, mch_key);
  
      const formBody = new URLSearchParams({
        mch_id: mch_id?.toString() ?? '',
        out_trade_no: out_trade_no?.toString() ?? '',
        timestamp: timestamp?.toString() ?? '',
        sign: sign?.toString() ?? '',
      }).toString();
  
      const response = await fetch('https://api.ltzf.cn/api/wxpay/get_pay_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('获取支付订单失败:', error);
      return NextResponse.json({ error: '内部服务器错误' }, { status: 500 });
    }
  }