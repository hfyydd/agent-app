import { NextRequest, NextResponse } from 'next/server';
import { AifadianOrderResponse } from '@/types';  // 添加这行导入语句

// 导入 md5 函数
import { createHash } from 'crypto';


// 定义 md5 函数
function md5(input: string): string {
    return createHash('md5').update(input).digest('hex');
}

export async function GET(request: NextRequest) {
    try {
        // 获取查询参数
        const searchParams = request.nextUrl.searchParams;
        let page = searchParams.get('page');
        let per_page = searchParams.get('per_page');
        let out_trade_no = searchParams.get('out_trade_no');


        console.log('接收到的参数:', { page, per_page, out_trade_no });

        const params: Record<string, any> = {};  // 明确声明为可接受任意键值对

        // 判断每个参数是否存在，只有存在时才添加到对象中
        if (page !== undefined) {
            params.page = page;
        }

        if (per_page !== undefined) {
            params.per_page = per_page;
        }

        if (out_trade_no !== undefined) {
            params.out_trade_no = out_trade_no;
        }
        //token和user_id放到.env.local文件中，不要上传到github上
        const token = '123456';
        const user_id = '10001';
        const ts = Math.floor(Date.now() / 1000);

        // 构建签名字符串
        const signString = `${token}params${JSON.stringify(params)}ts${ts}user_id${user_id}`;

        // 计算签名
        const sign = md5(signString);

        console.log('生成的签名:', sign);

        const requestBody = {
            user_id: user_id,
            params: JSON.stringify(params),
            ts: ts,
            sign: sign
        };

        const response = await fetch('https://afdian.com/api/open/query-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error('HTTP 状态码不为 200:', response.status);
            return NextResponse.json({ error: '请求aifadian接口错误' }, { status: 400 });
        }

        const data: AifadianOrderResponse = await response.json();
        console.log('查询订单的响应数据:', data);

        if (data != null && data.ec === 200) {
            console.log('ec 状态码为 200，数据请求成功');

            //TODO 处理订单

        } else {
            return NextResponse.json({ error: 'aifadian接口处理失败' }, { status: 400 });

        }






        return NextResponse.json(data);
    } catch (error) {
        console.error('处理 GET 请求时出错:', error);
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
    }
}
