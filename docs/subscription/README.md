# 订阅模块设计文档

订阅模块提供计划管理、订阅管理、点数管理、资源扩展包和优惠券功能。

## 目录

- [模块概述](#模块概述)
- [数据库设计](#数据库设计)
- [业务流程](#业务流程)
- [状态机](#状态机)
- [Client 端 API](#client-端-api)
- [Admin 端 API](#admin-端-api)
- [枚举说明](#枚举说明)
- [数据结构](#数据结构)

---

## 模块概述

### 核心概念

| 概念 | 说明 |
|------|------|
| **计划 (Plan)** | 订阅计划定义，包含功能权限和价格信息 |
| **功能 (Feature)** | 计划包含的功能，分为开关型和点数型 |
| **订阅 (Subscription)** | 团队订阅的计划实例，绑定到团队 |
| **点数 (Points)** | 团队的点数账户，用于点数型功能消费 |
| **点数批次 (Batch)** | 每次购买/赠送的点数记录，独立过期 |
| **资源包 (Resource Pack)** | 增加资源上限的扩展包 |
| **点数包 (Points Pack)** | 一次性充值的点数商品 |
| **优惠券 (Coupon)** | 订单优惠抵扣 |
| **订单 (Order)** | 支付订单记录 |
| **注册赠送包** | 用户注册时自动赠送的点数包，通过 `is_registration_gift=1` 标识 |

### 设计原则

1. **订阅绑定团队**：所有订阅计划绑定到团队，团队成员共享权益
2. **点数按批次过期**：每批购买的点数独立记录过期时间，消费时 FIFO 扣减
3. **升降级立即生效**：变更计划立即生效，已付费用不退款
4. **到期自动降级**：订阅到期未续费自动降为免费版，保留数据
5. **管理员赠送可配置过期**：管理员赠送点数/资源包时可设置过期时间
6. **注册赠送自动触发**：用户注册成功后，系统自动查询所有启用的注册赠送包（`is_registration_gift=1`）并全部赠送，点数过期时间跟随点数包的 `duration_days` 配置

### 功能类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **BOOLEAN（开关型）** | 有或无，计划决定是否可用 | 导出 PDF、高级分析、API 访问 |
| **POINTS（点数型）** | 使用时消耗点数 | AI 生成、图片处理、翻译 |

---

## 数据库设计

### ER 关系图

```
+-------------+       +-----------------+       +-------------+
|   Feature   |<------|   PlanFeature   |------>|    Plan     |
|   (功能)    |       |  (计划-功能)    |       |   (计划)    |
+-------------+       +-----------------+       +------+------+
                                                       |
                                                       v
+-------------+       +-----------------+       +-------------+
|    Team     |<------|  Subscription   |------>|   Order     |
|   (团队)    |       |    (订阅)       |       |   (订单)    |
+------+------+       +-----------------+       +------+------+
       |                                               |
       v                                               v
+-------------+       +-----------------+       +-------------+
|  TeamPoint  |<------|  PointsBatch    |       |   Payment   |
| (点数账户)  |       |  (点数批次)     |       |   (支付)    |
+------+------+       +-----------------+       +-------------+
       |
       v
+-------------+       +-----------------+       +-------------+
| Transaction |       |  ResourcePack   |       |   Coupon    |
|  (交易记录) |       |   (资源包)      |       |  (优惠券)   |
+-------------+       +-----------------+       +-------------+
```

### 表结构设计

#### sub_plan（订阅计划表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| plan_code | VARCHAR(50) | 计划编码（唯一），如：FREE、BASIC_MONTHLY |
| plan_name | VARCHAR(100) | 计划名称 |
| plan_level | INT | 计划等级（用于判断升降级） |
| plan_type | VARCHAR(20) | 计划类型：FREE/TRIAL/PAID |
| apply_scope | VARCHAR(20) | 适用范围：PERSONAL/COLLABORATION/ALL |
| description | TEXT | 计划描述 |
| price | DECIMAL(10,2) | 价格 |
| original_price | DECIMAL(10,2) | 原价（划线价） |
| currency | VARCHAR(10) | 货币类型：CNY/USD |
| duration_days | INT | 有效天数（NULL=永久） |
| daily_quota | INT | 每日配额 |
| monthly_quota | INT | 月度配额 |
| resource_limits | JSON | 资源上限配置 |
| min_seats | INT | 最小席位数 |
| max_seats | INT | 最大席位数 |
| seat_price | DECIMAL(10,2) | 每席位单价 |
| is_default | TINYINT | 是否默认计划 |
| is_trial | TINYINT | 是否试用计划 |
| is_visible | TINYINT | 是否前端可见 |
| sort_order | INT | 排序序号 |
| status | TINYINT | 状态：0-禁用，1-启用 |

**席位制计费说明**：

`min_seats`、`max_seats`、`seat_price` 用于席位制计费，常见于协作类 SaaS 产品：

| 字段 | 作用 | 示例 |
|------|------|------|
| `min_seats` | 购买该计划的**最少席位数** | 团队版最少 3 人起购 |
| `max_seats` | 该计划支持的**最大席位数** | 团队版最多 50 人 |
| `seat_price` | 每个席位的单价 | ¥99/席位/月 |

典型配置示例：

| 计划类型 | min_seats | max_seats | seat_price | 说明 |
|----------|-----------|-----------|------------|------|
| 个人版 | 1 | 1 | NULL | 不按席位计费，固定价格 |
| 团队版 | 3 | 50 | 99.00 | 最少3人起购，最多50人 |
| 企业版 | 10 | NULL | 79.00 | 最少10人起购，无上限，量大优惠 |

价格计算公式：
```
总价 = 基础价格(price) + 席位数 × 席位单价(seat_price)

例：团队版，5人团队
总价 = ¥0 + 5 × ¥99 = ¥495/月
```

校验规则：
- 购买时：`购买席位数 >= min_seats`
- 购买时：`购买席位数 <= max_seats`（如果 max_seats 不为 NULL）
- 团队成员数不能超过已购席位数

#### sub_feature（功能定义表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| feature_code | VARCHAR(50) | 功能编码（唯一） |
| feature_name | VARCHAR(100) | 功能名称 |
| feature_type | VARCHAR(20) | 功能类型：BOOLEAN/POINTS |
| description | TEXT | 功能描述 |
| points_cost | INT | 消耗点数（POINTS 类型有效） |
| sort_order | INT | 排序序号 |
| status | TINYINT | 状态 |

#### sub_plan_feature（计划功能关联表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| plan_id | BIGINT | 计划ID |
| feature_id | BIGINT | 功能ID |
| enabled | TINYINT | 是否启用 |
| limit_value | INT | 限制值（如每日使用次数上限） |

#### sub_subscription（订阅记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| team_id | BIGINT | 团队ID |
| plan_id | BIGINT | 计划ID |
| plan_code | VARCHAR(50) | 计划编码（冗余） |
| status | VARCHAR(20) | 订阅状态 |
| source | VARCHAR(20) | 订阅来源：PURCHASE/GRANT/SYSTEM |
| start_time | DATETIME | 开始时间 |
| end_time | DATETIME | 结束时间（NULL=永久） |
| seats | INT | 席位数 |
| order_id | BIGINT | 关联订单ID |
| previous_subscription_id | BIGINT | 前一个订阅ID（升降级时） |

#### sub_order（订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| order_no | VARCHAR(50) | 订单号（唯一） |
| team_id | BIGINT | 团队ID |
| user_id | BIGINT | 下单用户ID |
| order_type | VARCHAR(20) | 订单类型：SUBSCRIPTION/POINTS_PACK/RESOURCE_PACK |
| product_id | BIGINT | 商品ID（计划ID/点数包ID/资源包ID） |
| product_name | VARCHAR(100) | 商品名称 |
| quantity | INT | 数量 |
| original_amount | DECIMAL(10,2) | 原价金额 |
| discount_amount | DECIMAL(10,2) | 优惠金额 |
| pay_amount | DECIMAL(10,2) | 实付金额 |
| currency | VARCHAR(10) | 货币类型 |
| coupon_id | BIGINT | 使用的优惠券ID |
| coupon_code | VARCHAR(50) | 优惠券码 |
| status | VARCHAR(20) | 订单状态 |
| pay_method | VARCHAR(20) | 支付方式 |
| pay_time | DATETIME | 支付时间 |
| expire_time | DATETIME | 支付过期时间 |

#### sub_payment（支付记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| payment_no | VARCHAR(50) | 支付流水号（唯一） |
| order_id | BIGINT | 订单ID |
| order_no | VARCHAR(50) | 订单号 |
| pay_method | VARCHAR(20) | 支付方式：ALIPAY/WECHAT/STRIPE |
| pay_amount | DECIMAL(10,2) | 支付金额 |
| currency | VARCHAR(10) | 货币类型 |
| status | VARCHAR(20) | 支付状态 |
| third_party_trade_no | VARCHAR(100) | 第三方交易号 |
| pay_time | DATETIME | 支付成功时间 |
| callback_time | DATETIME | 回调时间 |
| callback_data | TEXT | 回调原始数据 |

#### pts_team_point（团队点数账户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| team_id | BIGINT | 团队ID（唯一） |
| total_points | BIGINT | 总点数 |
| used_points | BIGINT | 已使用点数 |
| available_points | BIGINT | 可用点数 |
| frozen_points | BIGINT | 冻结点数 |

#### pts_batch（点数批次表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| team_id | BIGINT | 团队ID |
| batch_no | VARCHAR(50) | 批次号 |
| source | VARCHAR(20) | 来源：PURCHASE/GRANT/SUBSCRIPTION |
| initial_points | INT | 初始点数 |
| remaining_points | INT | 剩余点数 |
| expire_time | DATETIME | 过期时间（NULL=永不过期） |
| order_id | BIGINT | 关联订单ID |
| grant_user_id | BIGINT | 赠送操作人ID（GRANT 时） |
| grant_reason | VARCHAR(500) | 赠送原因 |
| status | VARCHAR(20) | 状态：ACTIVE/EXPIRED/DEPLETED |

#### pts_transaction（点数交易记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| team_id | BIGINT | 团队ID |
| transaction_no | VARCHAR(50) | 交易流水号 |
| type | VARCHAR(20) | 交易类型：PURCHASE/CONSUME/GRANT/ADJUST/EXPIRE |
| points | INT | 点数变动（正数增加，负数减少） |
| balance_after | BIGINT | 交易后余额 |
| batch_id | BIGINT | 关联批次ID |
| feature_code | VARCHAR(50) | 消费的功能编码（CONSUME 时） |
| order_id | BIGINT | 关联订单ID |
| operator_id | BIGINT | 操作人ID |
| remark | VARCHAR(500) | 备注 |

#### sub_resource_pack（资源扩展包定义表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| pack_code | VARCHAR(50) | 扩展包编码 |
| pack_name | VARCHAR(100) | 扩展包名称 |
| resource_type | VARCHAR(20) | 资源类型：PROJECT/MEMBER/STORAGE |
| resource_amount | INT | 资源数量 |
| price | DECIMAL(10,2) | 价格 |
| currency | VARCHAR(10) | 货币类型 |
| duration_days | INT | 有效天数（NULL=永久） |
| description | TEXT | 描述 |
| is_visible | TINYINT | 是否前端可见 |
| sort_order | INT | 排序 |
| status | TINYINT | 状态 |

#### sub_team_resource（团队资源扩展记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| team_id | BIGINT | 团队ID |
| resource_type | VARCHAR(20) | 资源类型 |
| source | VARCHAR(20) | 来源：PURCHASE/GRANT |
| amount | INT | 资源数量 |
| expire_time | DATETIME | 过期时间 |
| order_id | BIGINT | 关联订单ID |
| pack_id | BIGINT | 关联资源包ID |
| grant_user_id | BIGINT | 赠送操作人ID |
| grant_reason | VARCHAR(500) | 赠送原因 |
| status | VARCHAR(20) | 状态：ACTIVE/EXPIRED |

#### sub_points_pack（点数包定义表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| pack_code | VARCHAR(50) | 点数包编码 |
| pack_name | VARCHAR(100) | 点数包名称 |
| points | INT | 点数数量 |
| price | DECIMAL(10,2) | 价格 |
| original_price | DECIMAL(10,2) | 原价 |
| currency | VARCHAR(10) | 货币类型 |
| duration_days | INT | 有效天数（NULL=永不过期） |
| description | TEXT | 描述 |
| is_visible | TINYINT | 是否前端可见 |
| is_registration_gift | TINYINT | 是否为注册赠送包：0-否，1-是 |
| sort_order | INT | 排序 |
| status | TINYINT | 状态 |

#### sub_coupon（优惠券定义表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| coupon_code | VARCHAR(50) | 优惠券码（唯一） |
| coupon_name | VARCHAR(100) | 优惠券名称 |
| coupon_type | VARCHAR(20) | 类型：FIXED/PERCENT |
| discount_value | DECIMAL(10,2) | 折扣值（FIXED=金额，PERCENT=百分比） |
| min_amount | DECIMAL(10,2) | 最低使用金额 |
| max_discount | DECIMAL(10,2) | 最大折扣金额（PERCENT 类型时） |
| apply_scope | VARCHAR(20) | 适用范围：ALL/SUBSCRIPTION/POINTS_PACK/RESOURCE_PACK |
| apply_plan_ids | JSON | 适用的计划ID列表（空=全部） |
| total_count | INT | 发放总量（NULL=不限） |
| used_count | INT | 已使用数量 |
| per_user_limit | INT | 每用户限用次数 |
| start_time | DATETIME | 生效开始时间 |
| end_time | DATETIME | 生效结束时间 |
| status | TINYINT | 状态 |

#### sub_coupon_usage（优惠券使用记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| coupon_id | BIGINT | 优惠券ID |
| coupon_code | VARCHAR(50) | 优惠券码 |
| team_id | BIGINT | 团队ID |
| user_id | BIGINT | 使用用户ID |
| order_id | BIGINT | 订单ID |
| discount_amount | DECIMAL(10,2) | 折扣金额 |
| use_time | DATETIME | 使用时间 |

#### team_daily_quota（团队每日配额表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| team_id | BIGINT | 团队ID |
| user_id | BIGINT | 用户ID（可选，用于按用户统计） |
| quota_date | DATE | 配额日期 |
| plan_quota | INT | 计划配额（来自订阅计划的 daily_quota） |
| extra_quota | INT | 额外配额（管理员临时赠送） |
| total_quota | INT | 总配额（plan_quota + extra_quota） |
| used_quota | INT | 已使用配额 |

#### team_monthly_quota（团队月度配额表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| team_id | BIGINT | 团队ID |
| user_id | BIGINT | 用户ID（可选，用于按用户统计） |
| quota_month | VARCHAR(7) | 配额月份（格式：2025-01） |
| plan_quota | INT | 计划配额（来自订阅计划的 monthly_quota） |
| extra_quota | INT | 额外配额（管理员临时赠送） |
| total_quota | INT | 总配额（plan_quota + extra_quota） |
| used_quota | INT | 已使用配额 |

---

## 业务流程

### 1. 订阅计划流程

```
+-------------------------------------------------------------------+
|                        订阅计划流程                                |
+-------------------------------------------------------------------+
|                                                                   |
|  +---------+    +---------+    +---------+    +---------+         |
|  | 选择计划 |--->| 创建订单 |--->| 支付订单 |--->| 激活订阅 |         |
|  +---------+    +---------+    +----+----+    +---------+         |
|                                     |                             |
|                                     v                             |
|                              +-------------+                      |
|                              | 支付回调处理 |                      |
|                              +------+------+                      |
|                                     |                             |
|                    +----------------+----------------+            |
|                    v                v                v            |
|              +---------+      +---------+      +---------+        |
|              |支付成功  |      |支付失败  |      |支付超时  |        |
|              +----+----+      +----+----+      +----+----+        |
|                   |                |                |             |
|                   v                v                v             |
|              +---------+      +---------+      +---------+        |
|              |激活订阅  |      |订单失败  |      |订单取消  |        |
|              +---------+      +---------+      +---------+        |
|                                                                   |
+-------------------------------------------------------------------+
```

### 2. 计划升降级流程

```
+-------------------------------------------------------------------+
|                        升降级流程                                  |
+-------------------------------------------------------------------+
|                                                                   |
|  +----------+                                                     |
|  | 当前计划  |                                                     |
|  +----+-----+                                                     |
|       |                                                           |
|       v                                                           |
|  +----------+    比较 plan_level                                  |
|  | 目标计划  |<-----------------+                                  |
|  +----+-----+                   |                                 |
|       |                         |                                 |
|  +----+-----+-------------------+                                 |
|  v          v                   v                                 |
| 升级       降级               平级（换周期）                        |
|  |          |                   |                                 |
|  v          v                   v                                 |
| 创建订单   创建订单            创建订单                             |
| 补差价     全额支付            全额支付                             |
|  |          |                   |                                 |
|  v          v                   v                                 |
| 支付成功   支付成功            支付成功                             |
|  |          |                   |                                 |
|  v          v                   v                                 |
| +---------------------------------------+                         |
| |         立即生效，不退款               |                         |
| |   - 结束当前订阅                       |                         |
| |   - 创建新订阅（立即开始）             |                         |
| |   - 原剩余时间作废                     |                         |
| +---------------------------------------+                         |
|                                                                   |
+-------------------------------------------------------------------+
```

### 3. 点数消费流程（FIFO）

```
+-------------------------------------------------------------------+
|                     点数消费流程（FIFO）                            |
+-------------------------------------------------------------------+
|                                                                   |
|  +---------------+                                                |
|  | 消费请求       |  需要消费 100 点                               |
|  | feature_code  |                                                |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 检查可用余额   |  available_points >= 100 ?                    |
|  +-------+-------+                                                |
|          |                                                        |
|     +----+----+                                                   |
|     v         v                                                   |
|   余额充足   余额不足                                              |
|     |         |                                                   |
|     |         v                                                   |
|     |    +---------+                                              |
|     |    | 返回失败 |                                              |
|     |    +---------+                                              |
|     v                                                             |
|  +-------------------------------------------+                    |
|  | 查询批次（按过期时间升序，FIFO）           |                    |
|  | ORDER BY expire_time ASC NULLS LAST       |                    |
|  +-------------------------------------------+                    |
|          |                                                        |
|          v                                                        |
|  +-------------------------------------------+                    |
|  | 批次1: 剩余 50 点，过期 2025-01-15        |  扣减 50 点         |
|  | 批次2: 剩余 80 点，过期 2025-02-01        |  扣减 50 点         |
|  | 批次3: 剩余 100 点，永不过期              |  不扣减             |
|  +-------------------------------------------+                    |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 更新账户余额   |  available_points -= 100                      |
|  | 记录交易流水   |  used_points += 100                           |
|  +---------------+                                                |
|                                                                   |
+-------------------------------------------------------------------+
```

### 4. 订阅到期处理流程

```
+-------------------------------------------------------------------+
|                      订阅到期处理（定时任务）                        |
+-------------------------------------------------------------------+
|                                                                   |
|  +---------------+                                                |
|  | 扫描即将到期   |  end_time <= NOW + 7天                         |
|  | 的订阅        |  status = ACTIVE                              |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 发送到期提醒   |  提前 7天/3天/1天 发送通知                     |
|  +---------------+                                                |
|                                                                   |
|  -------------- 到期时间到达 --------------                        |
|                                                                   |
|  +---------------+                                                |
|  | 扫描已到期订阅 |  end_time <= NOW                              |
|  |               |  status = ACTIVE                              |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +-------------------------------------------+                    |
|  | 处理到期：                                 |                    |
|  | 1. 将当前订阅标记为 EXPIRED               |                    |
|  | 2. 创建免费版订阅（SYSTEM 来源）          |                    |
|  | 3. 发送到期降级通知                       |                    |
|  +-------------------------------------------+                    |
|                                                                   |
+-------------------------------------------------------------------+
```

### 5. 点数批次过期处理流程

```
+-------------------------------------------------------------------+
|                    点数过期处理（定时任务）                          |
+-------------------------------------------------------------------+
|                                                                   |
|  +---------------+                                                |
|  | 扫描即将过期   |  expire_time <= NOW + 7天                     |
|  | 的点数批次    |  remaining_points > 0                         |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 发送过期提醒   |  通知用户剩余点数即将过期                       |
|  +---------------+                                                |
|                                                                   |
|  -------------- 过期时间到达 --------------                        |
|                                                                   |
|  +---------------+                                                |
|  | 扫描已过期批次 |  expire_time <= NOW                           |
|  |               |  status = ACTIVE                              |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +-------------------------------------------+                    |
|  | 处理过期：                                 |                    |
|  | 1. 标记批次状态为 EXPIRED                 |                    |
|  | 2. 从账户扣减过期点数                     |                    |
|  |    available_points -= remaining_points   |                    |
|  | 3. 记录过期交易流水（type=EXPIRE）        |                    |
|  +-------------------------------------------+                    |
|                                                                   |
+-------------------------------------------------------------------+
```

### 6. 配额消费流程

配额是定期重置的使用限制，与点数不同，配额在每天/每月自动恢复。

#### 配额 vs 点数 的区别

| 概念 | 特点 | 重置周期 | 示例 |
|------|------|----------|------|
| **点数 (Points)** | 消耗型，用完需购买 | 不重置 | 购买 1000 点，用一次减一次 |
| **每日配额 (Daily Quota)** | 限制型，自动恢复 | 每天 00:00 | 每日 100 次，次日恢复 |
| **月度配额 (Monthly Quota)** | 限制型，自动恢复 | 每月 1 日 | 每月 1000 次，次月恢复 |

#### 每日配额消费流程

```
+-------------------------------------------------------------------+
|                      每日配额消费流程                               |
+-------------------------------------------------------------------+
|                                                                   |
|  +---------------+                                                |
|  | 功能调用请求   |                                                |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 查询今日配额   |  SELECT * FROM team_daily_quota               |
|  | 记录          |  WHERE team_id=? AND quota_date=今天           |
|  +-------+-------+                                                |
|          |                                                        |
|     +----+----+                                                   |
|     v         v                                                   |
|   记录存在   记录不存在                                            |
|     |         |                                                   |
|     |         v                                                   |
|     |    +-----------------+                                      |
|     |    | 初始化今日配额   |                                      |
|     |    | plan_quota = 订阅计划的 daily_quota                    |
|     |    | extra_quota = 0                                        |
|     |    | total_quota = plan_quota                               |
|     |    | used_quota = 0                                         |
|     |    +-----------------+                                      |
|     |         |                                                   |
|     +----+----+                                                   |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 检查配额是否   |  used_quota < total_quota ?                   |
|  | 充足          |                                                |
|  +-------+-------+                                                |
|          |                                                        |
|     +----+----+                                                   |
|     v         v                                                   |
|   配额充足   配额不足                                              |
|     |         |                                                   |
|     |         v                                                   |
|     |    +---------+                                              |
|     |    | 返回失败 |  错误码：QUOTA_EXCEEDED                      |
|     |    +---------+                                              |
|     v                                                             |
|  +---------------+                                                |
|  | 消费配额       |  UPDATE used_quota = used_quota + 1           |
|  | (乐观锁)      |  WHERE data_version = ?                        |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 执行业务逻辑   |                                                |
|  +---------------+                                                |
|                                                                   |
+-------------------------------------------------------------------+
```

#### 月度配额消费流程

```
+-------------------------------------------------------------------+
|                      月度配额消费流程                               |
+-------------------------------------------------------------------+
|                                                                   |
|  +---------------+                                                |
|  | 功能调用请求   |                                                |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 查询本月配额   |  SELECT * FROM team_monthly_quota             |
|  | 记录          |  WHERE team_id=? AND quota_month='2025-01'     |
|  +-------+-------+                                                |
|          |                                                        |
|     +----+----+                                                   |
|     v         v                                                   |
|   记录存在   记录不存在                                            |
|     |         |                                                   |
|     |         v                                                   |
|     |    +-----------------+                                      |
|     |    | 初始化本月配额   |                                      |
|     |    | plan_quota = 订阅计划的 monthly_quota                  |
|     |    | extra_quota = 0                                        |
|     |    | total_quota = plan_quota                               |
|     |    | used_quota = 0                                         |
|     |    +-----------------+                                      |
|     |         |                                                   |
|     +----+----+                                                   |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 检查配额是否   |  used_quota < total_quota ?                   |
|  | 充足          |                                                |
|  +-------+-------+                                                |
|          |                                                        |
|     +----+----+                                                   |
|     v         v                                                   |
|   配额充足   配额不足                                              |
|     |         |                                                   |
|     |         v                                                   |
|     |    +---------+                                              |
|     |    | 返回失败 |  错误码：QUOTA_EXCEEDED                      |
|     |    +---------+                                              |
|     v                                                             |
|  +---------------+                                                |
|  | 消费配额       |  UPDATE used_quota = used_quota + 1           |
|  | (乐观锁)      |  WHERE data_version = ?                        |
|  +-------+-------+                                                |
|          |                                                        |
|          v                                                        |
|  +---------------+                                                |
|  | 执行业务逻辑   |                                                |
|  +---------------+                                                |
|                                                                   |
+-------------------------------------------------------------------+
```

#### 配额使用场景

| 配额类型 | 典型场景 | 计划配置示例 |
|----------|----------|--------------|
| `daily_quota` | AI 对话次数、API 调用、文件上传 | FREE: 10, BASIC: 100, PRO: 500 |
| `monthly_quota` | 报告生成、批量导出、高级分析 | FREE: 5, BASIC: 50, PRO: 200 |

---

### 7. 注册赠送点数流程

```
+-------------------------------------------------------------------+
|                      注册赠送点数流程                               |
+-------------------------------------------------------------------+
|                                                                   |
|  +---------+    +---------+    +-------------+    +---------+     |
|  | 用户注册 |--->| 创建团队 |--->| 查询赠送包   |--->| 赠送点数 |     |
|  +---------+    +---------+    +------+------+    +---------+     |
|                                       |                           |
|                                       v                           |
|                          +-------------------------+              |
|                          | is_registration_gift=1  |              |
|                          | status=1 (启用)         |              |
|                          +------------+------------+              |
|                                       |                           |
|                                       v                           |
|                          +-------------------------+              |
|                          | 遍历所有启用的赠送包     |              |
|                          +------------+------------+              |
|                                       |                           |
|                    +------------------+------------------+        |
|                    v                  v                  v        |
|             +------------+     +------------+     +------------+  |
|             |  赠送包1   |     |  赠送包2   |     |  赠送包N   |  |
|             +-----+------+     +-----+------+     +-----+------+  |
|                   |                  |                  |         |
|                   v                  v                  v         |
|             +------------+     +------------+     +------------+  |
|             | 创建批次    |     | 创建批次    |     | 创建批次    |  |
|             | source=GRANT|     | source=GRANT|     | source=GRANT|  |
|             +-----+------+     +-----+------+     +-----+------+  |
|                   |                  |                  |         |
|                   +------------------+------------------+         |
|                                      |                            |
|                                      v                            |
|                          +-------------------------+              |
|                          | 更新团队点数账户        |              |
|                          | 记录交易流水            |              |
|                          +-------------------------+              |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## 状态机

### 订阅状态 (SubscriptionStatus)

```
                    +-------------+
                    |   PENDING   |  待生效（预约订阅）
                    +------+------+
                           | 到达生效时间
                           v
+-------------+      +-------------+      +-------------+
|   SYSTEM    |----->|   ACTIVE    |----->|   EXPIRED   |
|  新团队默认  |      |    生效中   | 到期  |    已过期   |
+-------------+      +------+------+      +-------------+
                           |
                           | 升降级/取消
                           v
                    +-------------+
                    |  CANCELLED  |  已取消（被新订阅替代）
                    +-------------+
```

| 状态 | 说明 |
|------|------|
| PENDING | 待生效（用于预约订阅场景） |
| ACTIVE | 生效中 |
| EXPIRED | 已过期 |
| CANCELLED | 已取消（升降级时原订阅状态） |

### 订单状态 (OrderStatus)

```
+-------------+      +-------------+      +-------------+
|   PENDING   |----->|    PAID     |----->|  COMPLETED  |
|    待支付   | 支付  |    已支付   | 履约  |    已完成   |
+------+------+      +-------------+      +-------------+
       |
       | 超时/取消
       v
+-------------+
|  CANCELLED  |
|    已取消   |
+------+------+
       |
       | 申请退款（已支付订单）
       v
+-------------+
|  REFUNDING  |----->+-------------+
|   退款中    | 退款  |  REFUNDED   |
+-------------+ 完成  |    已退款   |
                     +-------------+
```

| 状态 | 说明 |
|------|------|
| PENDING | 待支付 |
| PAID | 已支付 |
| COMPLETED | 已完成（订阅已激活） |
| CANCELLED | 已取消 |
| REFUNDING | 退款中 |
| REFUNDED | 已退款 |

### 支付状态 (PaymentStatus)

```
+-------------+      +-------------+
|   PENDING   |----->|   SUCCESS   |
|    待支付   | 成功  |   支付成功  |
+------+------+      +-------------+
       |
       | 失败
       v
+-------------+
|   FAILED    |
|   支付失败  |
+-------------+
```

### 点数批次状态 (BatchStatus)

```
+-------------+      +-------------+
|   ACTIVE    |----->|  DEPLETED   |
|    有效     | 耗尽  |    已耗尽   |
+------+------+      +-------------+
       |
       | 过期
       v
+-------------+
|   EXPIRED   |
|    已过期   |
+-------------+
```

---

## Client 端 API

### 计划相关

基础路径：`/api/v1/plans`

#### 获取可用计划列表

```http
GET /api/v1/plans
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teamId | Long | 否 | 团队ID（用于筛选适用计划） |

**响应：**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "planCode": "BASIC_MONTHLY",
      "planName": "基础版-月付",
      "planLevel": 1,
      "planType": "PAID",
      "description": "适合个人和小团队",
      "price": 29.00,
      "originalPrice": 39.00,
      "currency": "CNY",
      "durationDays": 30,
      "features": [
        {
          "featureCode": "EXPORT_PDF",
          "featureName": "导出PDF",
          "featureType": "BOOLEAN",
          "enabled": true
        },
        {
          "featureCode": "AI_GENERATE",
          "featureName": "AI生成",
          "featureType": "POINTS",
          "pointsCost": 10,
          "enabled": true
        }
      ],
      "resourceLimits": {
        "PROJECT": 20,
        "MEMBER": 10,
        "STORAGE": 10
      }
    }
  ]
}
```

---

#### 获取计划详情

```http
GET /api/v1/plans/{planId}
```

---

#### 比较计划

```http
GET /api/v1/plans/compare?planIds={id1},{id2}
```

返回多个计划的功能对比。

---

### 订阅相关

基础路径：`/api/v1/subscriptions`

#### 获取当前订阅

```http
GET /api/v1/subscriptions/current?teamId={teamId}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "teamId": 100,
    "planId": 1,
    "planCode": "BASIC_MONTHLY",
    "planName": "基础版-月付",
    "status": "ACTIVE",
    "startTime": "2025-01-01T00:00:00",
    "endTime": "2025-01-31T23:59:59",
    "daysRemaining": 15,
    "features": [],
    "resourceLimits": {},
    "resourceUsage": {
      "PROJECT": 12,
      "MEMBER": 5,
      "STORAGE": 3
    }
  }
}
```

---

#### 创建订阅订单

```http
POST /api/v1/subscriptions
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teamId | Long | 是 | 团队ID |
| planId | Long | 是 | 计划ID |
| payMethod | String | 是 | 支付方式：ALIPAY/WECHAT/STRIPE |
| couponCode | String | 否 | 优惠券码 |

**示例：**

```json
{
  "teamId": 100,
  "planId": 2,
  "payMethod": "ALIPAY",
  "couponCode": "WELCOME2025"
}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "orderId": 1001,
    "orderNo": "SUB202501010001",
    "payAmount": 29.00,
    "discountAmount": 10.00,
    "payUrl": "https://...",
    "expireTime": "2025-01-01T00:30:00"
  }
}
```

---

#### 变更计划（升降级）

```http
POST /api/v1/subscriptions/change
```

**请求体：**

```json
{
  "teamId": 100,
  "newPlanId": 3,
  "payMethod": "ALIPAY"
}
```

**响应：** 同创建订阅订单

---

#### 获取订阅历史

```http
GET /api/v1/subscriptions/history?teamId={teamId}&page=1&size=20
```

---

### 点数相关

基础路径：`/api/v1/points`

#### 获取点数余额

```http
GET /api/v1/points/balance?teamId={teamId}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "teamId": 100,
    "totalPoints": 1000,
    "usedPoints": 300,
    "availablePoints": 700,
    "frozenPoints": 0,
    "batches": [
      {
        "batchNo": "B202501010001",
        "source": "PURCHASE",
        "initialPoints": 500,
        "remainingPoints": 200,
        "expireTime": "2025-02-01T23:59:59"
      },
      {
        "batchNo": "B202501050001",
        "source": "GRANT",
        "initialPoints": 500,
        "remainingPoints": 500,
        "expireTime": null
      }
    ]
  }
}
```

---

#### 消费点数

```http
POST /api/v1/points/consume
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teamId | Long | 是 | 团队ID |
| featureCode | String | 是 | 功能编码 |
| points | Integer | 是 | 消费点数 |
| bizId | String | 否 | 业务ID（幂等） |

**响应：**

```json
{
  "code": 200,
  "data": {
    "transactionNo": "T202501010001",
    "consumedPoints": 10,
    "balanceAfter": 690
  }
}
```

---

#### 获取点数交易记录

```http
GET /api/v1/points/transactions?teamId={teamId}&page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| type | String | 交易类型筛选 |
| startTime | DateTime | 开始时间 |
| endTime | DateTime | 结束时间 |

---

### 点数包相关

基础路径：`/api/v1/points-packs`

#### 获取点数包列表

```http
GET /api/v1/points-packs
```

---

#### 购买点数包

```http
POST /api/v1/points-packs/purchase
```

**请求体：**

```json
{
  "teamId": 100,
  "packId": 1,
  "quantity": 1,
  "payMethod": "ALIPAY",
  "couponCode": null
}
```

---

### 资源包相关

基础路径：`/api/v1/resource-packs`

#### 获取资源包列表

```http
GET /api/v1/resource-packs
```

---

#### 购买资源包

```http
POST /api/v1/resource-packs/purchase
```

**请求体：**

```json
{
  "teamId": 100,
  "packId": 1,
  "payMethod": "WECHAT"
}
```

---

#### 获取团队资源使用情况

```http
GET /api/v1/resource-packs/usage?teamId={teamId}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "teamId": 100,
    "resources": [
      {
        "type": "PROJECT",
        "limit": 25,
        "used": 12,
        "fromPlan": 20,
        "fromPacks": 5
      },
      {
        "type": "MEMBER",
        "limit": 15,
        "used": 8,
        "fromPlan": 10,
        "fromPacks": 5
      }
    ]
  }
}
```

---

### 优惠券相关

基础路径：`/api/v1/coupons`

#### 验证优惠券

```http
POST /api/v1/coupons/validate
```

**请求体：**

```json
{
  "couponCode": "WELCOME2025",
  "orderType": "SUBSCRIPTION",
  "productId": 1,
  "amount": 29.00
}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "valid": true,
    "couponName": "新用户优惠券",
    "discountAmount": 10.00,
    "finalAmount": 19.00
  }
}
```

---

### 订单相关

基础路径：`/api/v1/orders`

#### 获取订单列表

```http
GET /api/v1/orders?teamId={teamId}&page=1&size=20
```

---

#### 获取订单详情

```http
GET /api/v1/orders/{orderNo}
```

---

#### 取消订单

```http
POST /api/v1/orders/{orderNo}/cancel
```

仅 PENDING 状态可取消。

---

#### 查询支付状态

```http
GET /api/v1/orders/{orderNo}/pay-status
```

---

### 支付回调

基础路径：`/api/v1/payments`

#### 支付宝回调

```http
POST /api/v1/payments/callback/alipay
```

#### 微信支付回调

```http
POST /api/v1/payments/callback/wechat
```

#### Stripe 回调

```http
POST /api/v1/payments/callback/stripe
```

---

### 配额相关

基础路径：`/api/v1/quotas`

#### 获取当前配额

```http
GET /api/v1/quotas/current?teamId={teamId}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "teamId": 10,
    "daily": {
      "date": "2025-01-15",
      "planQuota": 100,
      "extraQuota": 20,
      "totalQuota": 120,
      "usedQuota": 45,
      "remainingQuota": 75,
      "resetTime": "2025-01-16T00:00:00"
    },
    "monthly": {
      "month": "2025-01",
      "planQuota": 1000,
      "extraQuota": 200,
      "totalQuota": 1200,
      "usedQuota": 350,
      "remainingQuota": 850,
      "resetTime": "2025-02-01T00:00:00"
    }
  }
}
```

---

#### 消费配额

```http
POST /api/v1/quotas/consume
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teamId | Long | 是 | 团队ID |
| quotaType | String | 是 | 配额类型：DAILY/MONTHLY |
| amount | Integer | 否 | 消费数量，默认 1 |
| bizId | String | 否 | 业务ID（幂等） |

**示例：**

```json
{
  "teamId": 10,
  "quotaType": "DAILY",
  "amount": 1,
  "bizId": "biz_123456"
}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "success": true,
    "quotaType": "DAILY",
    "consumed": 1,
    "remaining": 74
  }
}
```

**错误响应（配额不足）：**

```json
{
  "code": 409,
  "message": "配额不足",
  "data": {
    "quotaType": "DAILY",
    "required": 1,
    "remaining": 0
  }
}
```

---

#### 检查配额是否充足

```http
GET /api/v1/quotas/check?teamId={teamId}&quotaType={quotaType}&amount={amount}
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| teamId | Long | 是 | 团队ID |
| quotaType | String | 是 | 配额类型：DAILY/MONTHLY |
| amount | Integer | 否 | 需要的数量，默认 1 |

**响应：**

```json
{
  "code": 200,
  "data": {
    "sufficient": true,
    "quotaType": "DAILY",
    "required": 1,
    "remaining": 75
  }
}
```

---

#### 获取配额使用历史

```http
GET /api/v1/quotas/history?teamId={teamId}&quotaType={quotaType}&page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| quotaType | String | 配额类型：DAILY/MONTHLY |
| startDate | Date | 开始日期 |
| endDate | Date | 结束日期 |

**响应：**

```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "date": "2025-01-15",
        "planQuota": 100,
        "extraQuota": 20,
        "totalQuota": 120,
        "usedQuota": 95,
        "usageRate": "79.2%"
      },
      {
        "date": "2025-01-14",
        "planQuota": 100,
        "extraQuota": 0,
        "totalQuota": 100,
        "usedQuota": 100,
        "usageRate": "100%"
      }
    ],
    "total": 15
  }
}
```

---

## Admin 端 API

### 计划管理

基础路径：`/api/v1/admin/plans`

#### 分页查询计划

```http
GET /api/v1/admin/plans?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| planType | String | 计划类型筛选 |
| status | Boolean | 状态筛选 |
| keyword | String | 关键词搜索 |

---

#### 获取计划详情

```http
GET /api/v1/admin/plans/{id}
```

---

#### 创建计划

```http
POST /api/v1/admin/plans
```

**请求体：**

```json
{
  "planCode": "PRO_MONTHLY",
  "planName": "专业版-月付",
  "planLevel": 2,
  "planType": "PAID",
  "applyScope": "ALL",
  "description": "专业版描述",
  "price": 99.00,
  "originalPrice": 129.00,
  "currency": "CNY",
  "durationDays": 30,
  "dailyQuota": 100,
  "monthlyQuota": 1000,
  "resourceLimits": {
    "PROJECT": 50,
    "MEMBER": 30,
    "STORAGE": 100
  },
  "isVisible": true,
  "sortOrder": 2
}
```

**字段说明：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| planCode | String | 是 | 计划编码（唯一），如：`FREE`、`BASIC_MONTHLY`、`PRO_YEARLY` |
| planName | String | 是 | 计划名称 |
| planLevel | Integer | 是 | 计划等级（数值越大等级越高，用于判断升降级） |
| planType | String | 是 | 计划类型：`FREE`（免费版）、`TRIAL`（试用版）、`PAID`（付费版） |
| applyScope | String | 是 | 适用范围：`PERSONAL`（仅个人团队）、`COLLABORATION`（仅协作团队）、`ALL`（通用） |
| description | String | 否 | 计划描述 |
| price | Decimal | 是 | 价格（免费版填 0） |
| originalPrice | Decimal | 否 | 原价（划线价） |
| currency | String | 是 | 货币类型：`CNY`、`USD` |
| durationDays | Integer | 否 | 有效天数（NULL=永久，如免费版） |
| dailyQuota | Integer | 否 | 每日配额 |
| monthlyQuota | Integer | 否 | 月度配额 |
| resourceLimits | Object | 否 | 资源上限配置，参见 [ResourceType 资源类型](#resourcetype---资源类型) |
| isVisible | Boolean | 否 | 是否前端可见，默认 true |
| sortOrder | Integer | 否 | 排序序号 |

**planType 示例配置：**

| planType | 典型场景 | 价格 | durationDays |
|----------|----------|------|--------------|
| `FREE` | 免费版，注册即享 | 0 | NULL（永久） |
| `TRIAL` | 7天/14天试用 | 0 | 7 或 14 |
| `PAID` | 月付/年付订阅 | > 0 | 30 或 365 |

---

#### 更新计划

```http
PUT /api/v1/admin/plans/{id}
```

---

#### 配置计划功能

```http
PUT /api/v1/admin/plans/{id}/features
```

**请求体：**

```json
{
  "features": [
    {
      "featureId": 1,
      "enabled": true,
      "limitValue": null
    },
    {
      "featureId": 2,
      "enabled": true,
      "limitValue": 100
    }
  ]
}
```

---

#### 启用/禁用计划

```http
PUT /api/v1/admin/plans/{id}/status?status={true|false}
```

---

#### 删除计划

```http
DELETE /api/v1/admin/plans/{id}
```

仅未被使用的计划可删除。

---

### 功能管理

基础路径：`/api/v1/admin/features`

#### 分页查询功能

```http
GET /api/v1/admin/features?page=1&size=20
```

---

#### 创建功能

```http
POST /api/v1/admin/features
```

**请求体：**

```json
{
  "featureCode": "AI_TRANSLATE",
  "featureName": "AI翻译",
  "featureType": "POINTS",
  "description": "使用AI进行文本翻译",
  "pointsCost": 5,
  "sortOrder": 10
}
```

---

#### 更新功能

```http
PUT /api/v1/admin/features/{id}
```

---

#### 删除功能

```http
DELETE /api/v1/admin/features/{id}
```

---

### 订阅管理

基础路径：`/api/v1/admin/subscriptions`

#### 分页查询订阅

```http
GET /api/v1/admin/subscriptions?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| planId | Long | 计划ID |
| status | String | 订阅状态 |

---

#### 获取订阅详情

```http
GET /api/v1/admin/subscriptions/{id}
```

---

#### 手动赠送订阅

```http
POST /api/v1/admin/subscriptions/grant
```

**请求体：**

```json
{
  "teamId": 100,
  "planId": 2,
  "durationDays": 30,
  "reason": "用户补偿"
}
```

---

#### 延长订阅

```http
POST /api/v1/admin/subscriptions/{id}/extend
```

**请求体：**

```json
{
  "days": 7,
  "reason": "系统故障补偿"
}
```

---

#### 取消订阅（降级为免费）

```http
POST /api/v1/admin/subscriptions/{id}/cancel
```

**请求体：**

```json
{
  "reason": "用户申请退款"
}
```

---

### 点数管理

基础路径：`/api/v1/admin/points`

#### 分页查询点数账户

```http
GET /api/v1/admin/points/accounts?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| minBalance | Long | 最小余额 |
| maxBalance | Long | 最大余额 |

---

#### 获取账户详情

```http
GET /api/v1/admin/points/accounts/{teamId}
```

---

#### 调整点数（赠送/扣减）

```http
POST /api/v1/admin/points/adjust
```

**请求体：**

```json
{
  "teamId": 100,
  "points": 500,
  "expireDays": 90,
  "reason": "活动赠送"
}
```

> points 为正数表示赠送，负数表示扣减。expireDays 仅赠送时有效，为空表示永不过期。

---

#### 批量调整点数

```http
POST /api/v1/admin/points/batch-adjust
```

**请求体：**

```json
{
  "teamIds": [100, 101, 102],
  "points": 100,
  "expireDays": 30,
  "reason": "批量赠送"
}
```

---

#### 设置点数过期时间

```http
PUT /api/v1/admin/points/batches/{batchId}/expire
```

**请求体：**

```json
{
  "expireTime": "2025-06-30T23:59:59"
}
```

---

#### 分页查询交易记录

```http
GET /api/v1/admin/points/transactions?page=1&size=20
```

---

### 资源包管理

基础路径：`/api/v1/admin/resource-packs`

#### 分页查询资源包

```http
GET /api/v1/admin/resource-packs?page=1&size=20
```

---

#### 创建资源包

```http
POST /api/v1/admin/resource-packs
```

**请求体：**

```json
{
  "packCode": "PROJECT_10",
  "packName": "项目数+10",
  "resourceType": "PROJECT",
  "resourceAmount": 10,
  "price": 19.00,
  "currency": "CNY",
  "durationDays": null,
  "description": "永久增加10个项目数",
  "isVisible": true,
  "sortOrder": 1
}
```

---

#### 更新资源包

```http
PUT /api/v1/admin/resource-packs/{id}
```

---

#### 赠送资源包

```http
POST /api/v1/admin/resource-packs/grant
```

**请求体：**

```json
{
  "teamId": 100,
  "packId": 1,
  "expireDays": 365,
  "reason": "VIP客户赠送"
}
```

---

### 点数包管理

基础路径：`/api/v1/admin/points-packs`

#### 分页查询点数包

```http
GET /api/v1/admin/points-packs?page=1&size=20
```

---

#### 创建点数包

```http
POST /api/v1/admin/points-packs
```

**请求体：**

```json
{
  "packCode": "POINTS_1000",
  "packName": "1000点数包",
  "points": 1000,
  "price": 99.00,
  "originalPrice": 120.00,
  "currency": "CNY",
  "durationDays": 365,
  "description": "1000点数，1年有效期",
  "isVisible": true,
  "sortOrder": 1
}
```

---

#### 更新点数包

```http
PUT /api/v1/admin/points-packs/{id}
```

---

### 优惠券管理

基础路径：`/api/v1/admin/coupons`

#### 分页查询优惠券

```http
GET /api/v1/admin/coupons?page=1&size=20
```

---

#### 创建优惠券

```http
POST /api/v1/admin/coupons
```

**请求体：**

```json
{
  "couponCode": "WELCOME2025",
  "couponName": "新用户优惠券",
  "couponType": "FIXED",
  "discountValue": 10.00,
  "minAmount": 20.00,
  "applyScope": "SUBSCRIPTION",
  "applyPlanIds": [1, 2, 3],
  "totalCount": 1000,
  "perUserLimit": 1,
  "startTime": "2025-01-01T00:00:00",
  "endTime": "2025-12-31T23:59:59"
}
```

---

#### 获取优惠券详情

```http
GET /api/v1/admin/coupons/{id}
```

---

#### 更新优惠券

```http
PUT /api/v1/admin/coupons/{id}
```

---

#### 启用/禁用优惠券

```http
PUT /api/v1/admin/coupons/{id}/status?status={true|false}
```

---

#### 查询优惠券使用记录

```http
GET /api/v1/admin/coupons/{id}/usages?page=1&size=20
```

---

### 订单管理

基础路径：`/api/v1/admin/orders`

#### 分页查询订单

```http
GET /api/v1/admin/orders?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| orderNo | String | 订单号 |
| teamId | Long | 团队ID |
| orderType | String | 订单类型 |
| status | String | 订单状态 |
| payMethod | String | 支付方式 |
| startTime | DateTime | 开始时间 |
| endTime | DateTime | 结束时间 |

---

#### 获取订单详情

```http
GET /api/v1/admin/orders/{orderNo}
```

---

#### 订单退款

```http
POST /api/v1/admin/orders/{orderNo}/refund
```

**请求体：**

```json
{
  "refundAmount": 29.00,
  "reason": "用户申请退款"
}
```

---

### 支付记录

基础路径：`/api/v1/admin/payments`

#### 分页查询支付记录

```http
GET /api/v1/admin/payments?page=1&size=20
```

---

#### 获取支付详情

```http
GET /api/v1/admin/payments/{paymentNo}
```

---

### 订阅日志管理

基础路径：`/api/v1/admin/subscription-logs`

#### 分页查询延长记录

```http
GET /api/v1/admin/subscription-logs/extends?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| subscriptionId | Long | 订阅ID |
| operatorId | Long | 操作人ID |
| startTime | DateTime | 开始时间 |
| endTime | DateTime | 结束时间 |

**响应：**

```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": 1,
        "subscriptionId": 100,
        "teamId": 10,
        "teamName": "示例团队",
        "extendDays": 30,
        "originalEndTime": "2025-01-31T23:59:59",
        "newEndTime": "2025-03-02T23:59:59",
        "reason": "用户补偿",
        "operatorId": 1,
        "operatorName": "管理员",
        "createTime": "2025-01-15T10:00:00"
      }
    ],
    "total": 1
  }
}
```

---

#### 获取延长记录详情

```http
GET /api/v1/admin/subscription-logs/extends/{id}
```

---

#### 分页查询取消记录

```http
GET /api/v1/admin/subscription-logs/cancels?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| subscriptionId | Long | 订阅ID |
| cancelType | String | 取消类型：ADMIN/USER/REFUND/UPGRADE/DOWNGRADE |
| operatorId | Long | 操作人ID |
| startTime | DateTime | 开始时间 |
| endTime | DateTime | 结束时间 |

**响应：**

```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": 1,
        "subscriptionId": 100,
        "teamId": 10,
        "teamName": "示例团队",
        "planId": 2,
        "planCode": "PRO_MONTHLY",
        "planName": "专业版-月付",
        "cancelType": "ADMIN",
        "cancelTypeDesc": "管理员取消",
        "originalStatus": "ACTIVE",
        "originalStatusDesc": "生效中",
        "originalEndTime": "2025-02-28T23:59:59",
        "reason": "用户申请退款",
        "refundId": null,
        "newSubscriptionId": null,
        "operatorId": 1,
        "operatorName": "管理员",
        "createTime": "2025-01-15T10:00:00"
      }
    ],
    "total": 1
  }
}
```

---

#### 获取取消记录详情

```http
GET /api/v1/admin/subscription-logs/cancels/{id}
```

---

### 配额管理

基础路径：`/api/v1/admin/quotas`

#### 分页查询每日配额记录

```http
GET /api/v1/admin/quotas/daily?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| quotaDate | Date | 配额日期（格式：2025-01-15） |
| startDate | Date | 开始日期 |
| endDate | Date | 结束日期 |

**响应：**

```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": 1,
        "teamId": 10,
        "teamName": "示例团队",
        "quotaDate": "2025-01-15",
        "planQuota": 100,
        "extraQuota": 20,
        "totalQuota": 120,
        "usedQuota": 45,
        "remainingQuota": 75,
        "usageRate": "37.5%",
        "createTime": "2025-01-15T00:00:00"
      }
    ],
    "total": 1
  }
}
```

---

#### 分页查询月度配额记录

```http
GET /api/v1/admin/quotas/monthly?page=1&size=20
```

**查询参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| teamId | Long | 团队ID |
| quotaMonth | String | 配额月份（格式：2025-01） |
| startMonth | String | 开始月份 |
| endMonth | String | 结束月份 |

**响应：**

```json
{
  "code": 200,
  "data": {
    "records": [
      {
        "id": 1,
        "teamId": 10,
        "teamName": "示例团队",
        "quotaMonth": "2025-01",
        "planQuota": 1000,
        "extraQuota": 200,
        "totalQuota": 1200,
        "usedQuota": 350,
        "remainingQuota": 850,
        "usageRate": "29.2%",
        "createTime": "2025-01-01T00:00:00"
      }
    ],
    "total": 1
  }
}
```

---

#### 赠送额外配额（每日）

```http
POST /api/v1/admin/quotas/daily/grant
```

**请求体：**

```json
{
  "teamId": 10,
  "quotaDate": "2025-01-15",
  "extraQuota": 50,
  "reason": "临时活动赠送"
}
```

---

#### 赠送额外配额（月度）

```http
POST /api/v1/admin/quotas/monthly/grant
```

**请求体：**

```json
{
  "teamId": 10,
  "quotaMonth": "2025-01",
  "extraQuota": 500,
  "reason": "VIP客户赠送"
}
```

---

#### 获取团队配额统计

```http
GET /api/v1/admin/quotas/stats/{teamId}
```

**响应：**

```json
{
  "code": 200,
  "data": {
    "teamId": 10,
    "teamName": "示例团队",
    "daily": {
      "date": "2025-01-15",
      "planQuota": 100,
      "extraQuota": 20,
      "totalQuota": 120,
      "usedQuota": 45,
      "remainingQuota": 75
    },
    "monthly": {
      "month": "2025-01",
      "planQuota": 1000,
      "extraQuota": 200,
      "totalQuota": 1200,
      "usedQuota": 350,
      "remainingQuota": 850
    }
  }
}
```

---

## 枚举说明

### PlanType - 计划类型

| 值 | 说明 |
|------|------|
| FREE | 免费版 |
| TRIAL | 试用版 |
| PAID | 付费版 |

### ApplyScope - 适用范围

| 值 | 说明 |
|------|------|
| PERSONAL | 仅个人团队 |
| COLLABORATION | 仅协作团队 |
| ALL | 通用 |

### FeatureType - 功能类型

| 值 | 说明 |
|------|------|
| BOOLEAN | 开关型（有/无） |
| POINTS | 点数型（消耗点数） |

### SubscriptionStatus - 订阅状态

| 值 | 说明 |
|------|------|
| PENDING | 待生效 |
| ACTIVE | 生效中 |
| EXPIRED | 已过期 |
| CANCELLED | 已取消 |

### SubscriptionSource - 订阅来源

| 值 | 说明 |
|------|------|
| PURCHASE | 购买 |
| GRANT | 赠送 |
| SYSTEM | 系统（默认分配） |

### OrderType - 订单类型

| 值 | 说明 |
|------|------|
| SUBSCRIPTION | 订阅计划 |
| POINTS_PACK | 点数包 |
| RESOURCE_PACK | 资源包 |

### OrderStatus - 订单状态

| 值 | 说明 |
|------|------|
| PENDING | 待支付 |
| PAID | 已支付 |
| COMPLETED | 已完成 |
| CANCELLED | 已取消 |
| REFUNDING | 退款中 |
| REFUNDED | 已退款 |

### PayMethod - 支付方式

| 值 | 说明 |
|------|------|
| ALIPAY | 支付宝 |
| WECHAT | 微信支付 |
| STRIPE | Stripe（信用卡） |

### PaymentStatus - 支付状态

| 值 | 说明 |
|------|------|
| PENDING | 待支付 |
| SUCCESS | 支付成功 |
| FAILED | 支付失败 |

### BatchStatus - 点数批次状态

| 值 | 说明 |
|------|------|
| ACTIVE | 有效 |
| DEPLETED | 已耗尽 |
| EXPIRED | 已过期 |

### BatchSource - 点数批次来源

| 值 | 说明 |
|------|------|
| PURCHASE | 购买 |
| GRANT | 赠送 |
| SUBSCRIPTION | 订阅附带 |

### TransactionType - 点数交易类型

| 值 | 说明 |
|------|------|
| PURCHASE | 购买 |
| CONSUME | 消费 |
| GRANT | 赠送 |
| ADJUST | 调整 |
| EXPIRE | 过期 |
| REFUND | 退款返还 |

### ResourceType - 资源类型

系统支持的资源类型定义。`sub_plan.resource_limits` 字段 **只允许** 使用下表中定义的资源编码。

| 编码 | 名称 | 描述 | 单位 | 默认值 |
|------|------|------|------|--------|
| PROJECT | 项目数 | 可创建的项目数量上限 | 个 | 5 |
| MEMBER | 成员数 | 团队成员数量上限 | 人 | 3 |
| STORAGE | 存储空间 | 存储空间上限 | GB | 1 |

#### resource_limits 配置规范

`sub_plan` 表的 `resource_limits` 字段为 JSON 格式，配置计划包含的资源上限。

**格式**：
```json
{
  "资源编码": 上限值,
  ...
}
```

**示例**：
```json
{
  "PROJECT": 20,
  "MEMBER": 10,
  "STORAGE": 100
}
```

**验证规则**：
1. 键名必须是上表中定义的资源编码（`PROJECT`、`MEMBER`、`STORAGE`）
2. 值必须是正整数
3. 未配置的资源类型将使用默认值
4. 不允许使用未定义的资源编码

**扩展资源类型**：

如需新增资源类型，请按以下步骤操作：

1. 在 `ResourceType` 枚举类中添加新的枚举值
2. 更新本文档的资源类型表
3. 在资源使用统计服务中实现对应的统计逻辑
4. 更新前端资源显示组件

### CouponType - 优惠券类型

| 值 | 说明 |
|------|------|
| FIXED | 固定金额减免 |
| PERCENT | 百分比折扣 |

### CouponApplyScope - 优惠券适用范围

| 值 | 说明 |
|------|------|
| ALL | 全部商品 |
| SUBSCRIPTION | 仅订阅计划 |
| POINTS_PACK | 仅点数包 |
| RESOURCE_PACK | 仅资源包 |

---

## 数据结构

### PlanVO - 计划信息

```json
{
  "id": 1,
  "planCode": "BASIC_MONTHLY",
  "planName": "基础版-月付",
  "planLevel": 1,
  "planType": "PAID",
  "planTypeDesc": "付费版",
  "applyScope": "ALL",
  "applyScopeDesc": "通用",
  "description": "适合个人和小团队使用",
  "price": 29.00,
  "originalPrice": 39.00,
  "currency": "CNY",
  "durationDays": 30,
  "dailyQuota": 50,
  "monthlyQuota": 500,
  "resourceLimits": {
    "PROJECT": 20,
    "MEMBER": 10,
    "STORAGE": 10
  },
  "features": [
    {
      "featureCode": "EXPORT_PDF",
      "featureName": "导出PDF",
      "featureType": "BOOLEAN",
      "enabled": true
    }
  ],
  "isDefault": false,
  "isTrial": false,
  "sortOrder": 1
}
```

### CurrentSubscriptionVO - 当前订阅信息

```json
{
  "id": 1,
  "teamId": 100,
  "planId": 1,
  "planCode": "BASIC_MONTHLY",
  "planName": "基础版-月付",
  "planLevel": 1,
  "status": "ACTIVE",
  "statusDesc": "生效中",
  "source": "PURCHASE",
  "sourceDesc": "购买",
  "startTime": "2025-01-01T00:00:00",
  "endTime": "2025-01-31T23:59:59",
  "daysRemaining": 15,
  "features": [],
  "resourceLimits": {
    "PROJECT": 20,
    "MEMBER": 10,
    "STORAGE": 10
  },
  "resourceUsage": {
    "PROJECT": 12,
    "MEMBER": 5,
    "STORAGE": 3
  }
}
```

### PointsBalanceVO - 点数余额

```json
{
  "teamId": 100,
  "totalPoints": 1000,
  "usedPoints": 300,
  "availablePoints": 700,
  "frozenPoints": 0,
  "expiringPoints": 200,
  "expiringTime": "2025-02-01T23:59:59",
  "batches": [
    {
      "batchNo": "B202501010001",
      "source": "PURCHASE",
      "sourceDesc": "购买",
      "initialPoints": 500,
      "remainingPoints": 200,
      "expireTime": "2025-02-01T23:59:59",
      "createTime": "2025-01-01T10:00:00"
    }
  ]
}
```

### TransactionVO - 交易记录

```json
{
  "id": 1,
  "transactionNo": "T202501010001",
  "type": "CONSUME",
  "typeDesc": "消费",
  "points": -10,
  "balanceAfter": 690,
  "featureCode": "AI_GENERATE",
  "featureName": "AI生成",
  "remark": null,
  "createTime": "2025-01-15T14:30:00"
}
```

### OrderVO - 订单信息

```json
{
  "id": 1,
  "orderNo": "SUB202501010001",
  "teamId": 100,
  "teamName": "我的团队",
  "orderType": "SUBSCRIPTION",
  "orderTypeDesc": "订阅计划",
  "productId": 1,
  "productName": "基础版-月付",
  "quantity": 1,
  "originalAmount": 39.00,
  "discountAmount": 10.00,
  "payAmount": 29.00,
  "currency": "CNY",
  "couponCode": "WELCOME2025",
  "status": "COMPLETED",
  "statusDesc": "已完成",
  "payMethod": "ALIPAY",
  "payMethodDesc": "支付宝",
  "payTime": "2025-01-01T10:05:00",
  "createTime": "2025-01-01T10:00:00"
}
```

### ResourceUsageVO - 资源使用情况

```json
{
  "teamId": 100,
  "resources": [
    {
      "type": "PROJECT",
      "typeDesc": "项目数",
      "limit": 25,
      "used": 12,
      "available": 13,
      "fromPlan": 20,
      "fromPacks": 5,
      "packs": [
        {
          "packName": "项目数+5",
          "amount": 5,
          "expireTime": "2025-06-30T23:59:59"
        }
      ]
    }
  ]
}
```

### CouponVO - 优惠券信息

```json
{
  "id": 1,
  "couponCode": "WELCOME2025",
  "couponName": "新用户优惠券",
  "couponType": "FIXED",
  "couponTypeDesc": "固定金额",
  "discountValue": 10.00,
  "minAmount": 20.00,
  "maxDiscount": null,
  "applyScope": "SUBSCRIPTION",
  "applyScopeDesc": "订阅计划",
  "startTime": "2025-01-01T00:00:00",
  "endTime": "2025-12-31T23:59:59",
  "totalCount": 1000,
  "usedCount": 150,
  "remainingCount": 850,
  "perUserLimit": 1,
  "status": true
}
```

---

## 通用响应格式

所有 API 返回统一格式：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

错误响应：

```json
{
  "code": 500,
  "message": "错误信息",
  "data": null
}
```

常见错误码：

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未登录 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 业务冲突（如余额不足、优惠券已过期等） |
| 500 | 服务器内部错误 |