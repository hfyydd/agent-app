//订单表
CREATE TABLE orders (
  order_number VARCHAR(50) PRIMARY KEY,            -- 订单号作为主键
  user_id BIGINT NOT NULL,                         -- 用户ID
  order_type SMALLINT NOT NULL,                    -- 订单类型，0是平台充值，1是e2m app订阅，其他产品待扩充
  amount DECIMAL(10, 2) NOT NULL,                  -- 订单金额
  payment_status SMALLINT NOT NULL DEFAULT 0,      -- 支付状态 0 未支付 1已支付 2 支付失败
  processing_status SMALLINT NOT NULL DEFAULT 0,   -- 订单处理状态 0 初始状态 1 已处理
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- 创建时间
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- 更新时间
);

//订阅表
CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY,                           -- 订阅ID 
  user_id BIGINT NOT NULL,                         -- 用户ID
  order_number VARCHAR(50),                        -- 关联的订单号
  product_type SMALLINT NOT NULL,                  -- 产品类型, 1是e2m app 其他待补充
  start_date DATE NOT NULL,                        -- 订阅开始日期
  end_date DATE NOT NULL,                          -- 订阅结束日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- 创建时间
);

-- 查询某用户对某产品是否还在订阅中
SELECT EXISTS (
  SELECT 1
  FROM subscriptions
  WHERE user_id = :user_id
    AND product_type = :product_type
    AND CURRENT_DATE BETWEEN start_date AND end_date
) AS is_subscribed;


