import { NextResponse } from 'next/server';
import { AifadianWebhookData } from '@/types';  // 添加这行导入语句

console.log('API 路由文件已加载');


export async function POST(request: Request) {
  console.log('收到 POST 请求');
  try {
    const jsonData: AifadianWebhookData = await request.json();
    console.log('接收到的 JSON 数据:', JSON.stringify(jsonData, null, 2));
    
    // 这里可以添加处理 jsonData 的逻辑
    if (jsonData != null && jsonData.ec === 200) {
      console.log('ec 状态码为 200，数据处理成功');
      
      const customOrderId = jsonData.data.order.custom_order_id;
      console.log('获取到的 custom_order_id:', customOrderId);

      //先查询该订单的状态，如果是初始状态，才去更新订单状态
      //否则不处理

      //更新该订单的支付状态

      // 要求开发者响应的JSON示例，如果接口不返回ec 200 ，则平台认为回调失败 
      //json示例 {"ec":200,"em":"ok"} 
      return NextResponse.json({ ec: 200, em: 'ok' });
    } else {
      console.error('ec 状态码不为 200，数据处理失败');
      return NextResponse.json({ ec: 400, em: 'error' });
    }
  } catch (error) {
    console.error('解析 JSON 数据时出错:', error);
    return NextResponse.json({ ec: 500, em: 'error' });
  }
}

export async function GET() {
  console.log('收到 GET 请求');
  return NextResponse.json({ message: 'Test GET response' });
}