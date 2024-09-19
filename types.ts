export interface Workflow {
    id: string;
    name: string;
    description: string;
    views: number;
    tags: string[];
    content: string;
    price?: number;
    icon_url: string;
    test_url: string;
    downloads: number;
    updated_at: string;
    content_image_url: string;
  }

export interface FeaturedWorkflow {
    workflow_id: string;
    workflows: Workflow;
  }

  export class Order {
    out_trade_no: string;
    custom_order_id: string;
    user_id: string;
    plan_id: string;
    title: string;
    month: number;
    total_amount: string;
    show_amount: string;
    status: number;
    remark: string;
    redeem_id: string;
    product_type: number;
    discount: string;
    sku_detail: {
      sku_id: string;
      count: number;
      name: string;
      album_id: string;
      pic: string;
    }[];
    address_person: string;
    address_phone: string;
    address_address: string;

    constructor({
      out_trade_no,
      custom_order_id,
      user_id,
      plan_id,
      title,
      month,
      total_amount,
      show_amount,
      status,
      remark,
      redeem_id,
      product_type,
      discount,
      sku_detail,
      address_person,
      address_phone,
      address_address,
    }: {
      out_trade_no: string;
      custom_order_id: string;
      user_id: string;
      plan_id: string;
      title: string;
      month: number;
      total_amount: string;
      show_amount: string;
      status: number;
      remark: string;
      redeem_id: string;
      product_type: number;
      discount: string;
      sku_detail: any[];
      address_person: string;
      address_phone: string;
      address_address: string;
    }) {
      this.out_trade_no = out_trade_no;
      this.custom_order_id = custom_order_id;
      this.user_id = user_id;
      this.plan_id = plan_id;
      this.title = title;
      this.month = month;
      this.total_amount = total_amount;
      this.show_amount = show_amount;
      this.status = status;
      this.remark = remark;
      this.redeem_id = redeem_id;
      this.product_type = product_type;
      this.discount = discount;
      this.sku_detail = sku_detail;
      this.address_person = address_person;
      this.address_phone = address_phone;
      this.address_address = address_address;
    }
  }

  export interface AifadianWebhookData {
    ec: number;
    em: string;
    data: {
      type: string;
      order: Order;
    };
  }

