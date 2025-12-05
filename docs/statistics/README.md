# 统计功能设计方案

## 概述

本方案设计一个完整的统计仪表盘功能，为管理员提供用户、团队、业务等多维度的数据统计和可视化展示。

## 模块结构

```
template-core/src/main/java/com/yicheng/system/module/statistics/
├── dto/
│   └── StatisticsQueryDTO.java          # 统计查询条件
├── vo/
│   ├── DashboardVO.java                  # 仪表盘汇总数据
│   ├── UserStatisticsVO.java             # 用户统计
│   ├── TeamStatisticsVO.java             # 团队统计
│   ├── BusinessStatisticsVO.java         # 业务统计
│   ├── RevenueStatisticsVO.java          # 收入统计
│   ├── PointsRankingVO.java              # 点数排行榜
│   └── TrendDataVO.java                  # 趋势数据
├── service/
│   ├── IStatisticsService.java           # 统计服务接口
│   └── IStatisticsServiceImpl.java       # 统计服务实现
└── enums/
    └── StatisticsPeriod.java             # 统计周期枚举
```

---

## API 设计

### Admin 端控制器

**路径**: `template-admin/.../controller/StatisticsController.java`

```
GET /api/v1/admin/statistics/dashboard     # 仪表盘汇总
GET /api/v1/admin/statistics/users         # 用户统计详情
GET /api/v1/admin/statistics/teams         # 团队统计详情
GET /api/v1/admin/statistics/business      # 业务统计详情
GET /api/v1/admin/statistics/revenue       # 收入统计详情
GET /api/v1/admin/statistics/points/ranking/available  # 点数可用排行榜
GET /api/v1/admin/statistics/points/ranking/usage      # 点数使用排行榜
```

---

## 数据结构设计

### 1. 仪表盘汇总 (DashboardVO)

```java
@Data
public class DashboardVO {
    // ===== 用户统计 =====
    private Long totalUsers;                    // 用户总数
    private Long todayNewUsers;                 // 今日新增用户
    private TrendDataVO userTrend;              // 用户增长趋势

    // ===== 团队统计 =====
    private Long totalTeams;                    // 团队总数
    private Long todayNewTeams;                 // 今日新增团队
    private TrendDataVO teamTrend;              // 团队增长趋势

    // ===== 业务统计 =====
    private Long totalPlans;                    // 计划数量
    private Long totalFeatures;                 // 功能数量
    private Long totalSubscriptions;            // 订阅数量
    private Long totalAvailablePoints;          // 全部可用点数
    private Long totalGrants;                   // 赠送数量
    private Long totalResourcePacks;            // 扩容包数量

    // ===== 收入统计 =====
    private BigDecimal todayRevenue;            // 今日收入
    private BigDecimal monthRevenue;            // 本月收入
    private BigDecimal yearRevenue;             // 本年收入
}
```

### 2. 趋势数据 (TrendDataVO)

```java
@Data
public class TrendDataVO {
    private Integer todayCount;                 // 今日数量
    private Integer yesterdayCount;             // 昨日数量
    private Double dayOverDayRate;              // 日环比增幅(%)

    private Integer thisMonthCount;             // 本月数量
    private Integer lastMonthCount;             // 上月数量
    private Double monthOverMonthRate;          // 月环比增幅(%)

    private Integer thisYearCount;              // 本年数量
    private Integer lastYearCount;              // 去年数量
    private Double yearOverYearRate;            // 年同比增幅(%)

    private List<DailyCountVO> dailyData;       // 每日数据(用于图表)
    private List<MonthlyCountVO> monthlyData;   // 每月数据(用于图表)
}

@Data
public class DailyCountVO {
    private String date;                        // 日期 (YYYY-MM-DD)
    private Integer count;                      // 数量
}

@Data
public class MonthlyCountVO {
    private String month;                       // 月份 (YYYY-MM)
    private Integer count;                      // 数量
}
```

### 3. 用户统计详情 (UserStatisticsVO)

```java
@Data
public class UserStatisticsVO {
    private Long totalUsers;                    // 用户总数
    private Long activeUsers;                   // 活跃用户数
    private Long disabledUsers;                 // 禁用用户数

    private TrendDataVO trend;                  // 增长趋势

    private List<DailyCountVO> dailyNewUsers;   // 每日新增用户(近30天)
    private List<MonthlyCountVO> monthlyNewUsers; // 每月新增用户(近12月)
}
```

### 4. 团队统计详情 (TeamStatisticsVO)

```java
@Data
public class TeamStatisticsVO {
    private Long totalTeams;                    // 团队总数
    private Long personalTeams;                 // 个人空间数
    private Long collaborationTeams;            // 协作空间数
    private Long disbandedTeams;                // 已解散团队数

    private TrendDataVO trend;                  // 增长趋势

    private List<DailyCountVO> dailyNewTeams;   // 每日新增团队(近30天)
    private List<MonthlyCountVO> monthlyNewTeams; // 每月新增团队(近12月)
}
```

### 5. 业务统计详情 (BusinessStatisticsVO)

```java
@Data
public class BusinessStatisticsVO {
    // 计划统计
    private Long totalPlans;                    // 计划总数
    private Long activePlans;                   // 启用计划数
    private Long freePlans;                     // 免费计划数
    private Long paidPlans;                     // 付费计划数

    // 功能统计
    private Long totalFeatures;                 // 功能总数
    private Long activeFeatures;                // 启用功能数

    // 订阅统计
    private Long totalSubscriptions;            // 订阅总数
    private Long activeSubscriptions;           // 活跃订阅数
    private Long expiredSubscriptions;          // 过期订阅数
    private Long grantedSubscriptions;          // 赠送订阅数
    private Long purchasedSubscriptions;        // 购买订阅数

    // 点数统计
    private Long totalAvailablePoints;          // 全部可用点数
    private Long totalUsedPoints;               // 全部已使用点数
    private Long totalFrozenPoints;             // 全部冻结点数

    // 赠送统计
    private Long totalGrants;                   // 赠送总数
    private Long subscriptionGrants;            // 订阅赠送数
    private Long pointsGrants;                  // 点数赠送数
    private Long resourceGrants;                // 资源赠送数

    // 扩容包统计
    private Long totalResourcePacks;            // 扩容包总数
    private Long activeResourcePacks;           // 生效中扩容包数
    private Long expiredResourcePacks;          // 已过期扩容包数
}
```

### 6. 收入统计详情 (RevenueStatisticsVO)

```java
@Data
public class RevenueStatisticsVO {
    // 收入汇总
    private BigDecimal todayRevenue;            // 今日收入
    private BigDecimal yesterdayRevenue;        // 昨日收入
    private Double dayOverDayRate;              // 日环比(%)

    private BigDecimal thisMonthRevenue;        // 本月收入
    private BigDecimal lastMonthRevenue;        // 上月收入
    private Double monthOverMonthRate;          // 月环比(%)

    private BigDecimal thisYearRevenue;         // 本年收入
    private BigDecimal lastYearRevenue;         // 去年收入
    private Double yearOverYearRate;            // 年同比(%)

    // 收入明细
    private BigDecimal subscriptionRevenue;     // 订阅收入
    private BigDecimal pointsPackRevenue;       // 点数包收入
    private BigDecimal resourcePackRevenue;     // 资源包收入

    // 趋势数据
    private List<DailyRevenueVO> dailyRevenue;  // 每日收入(近30天)
    private List<MonthlyRevenueVO> monthlyRevenue; // 每月收入(近12月)
}

@Data
public class DailyRevenueVO {
    private String date;                        // 日期 (YYYY-MM-DD)
    private BigDecimal amount;                  // 金额
}

@Data
public class MonthlyRevenueVO {
    private String month;                       // 月份 (YYYY-MM)
    private BigDecimal amount;                  // 金额
}
```

### 7. 点数排行榜 (PointsRankingVO)

```java
@Data
public class PointsRankingVO {
    private List<TeamPointsRankVO> rankings;    // 排行榜数据
    private Integer totalCount;                 // 总条数
}

@Data
public class TeamPointsRankVO {
    private Integer rank;                       // 排名
    private Long teamId;                        // 团队ID
    private String teamName;                    // 团队名称
    private String teamLogo;                    // 团队Logo
    private String ownerName;                   // 所有者名称
    private Long availablePoints;               // 可用点数 (用于可用排行)
    private Long usedPoints;                    // 已使用点数 (用于使用排行)
    private Long totalPoints;                   // 总点数
}
```

### 8. 查询条件 (StatisticsQueryDTO)

```java
@Data
public class StatisticsQueryDTO {
    private String period;                      // 周期: DAY/WEEK/MONTH/YEAR
    private Date startDate;                     // 开始日期
    private Date endDate;                       // 结束日期
    private Integer limit;                      // 限制条数(排行榜用, 默认10)
}
```

### 9. 统计周期枚举 (StatisticsPeriod)

```java
public enum StatisticsPeriod {
    DAY("日"),
    WEEK("周"),
    MONTH("月"),
    QUARTER("季"),
    YEAR("年");

    private final String desc;
}
```

---

## 服务接口设计

### IStatisticsService

```java
public interface IStatisticsService {

    /**
     * 获取仪表盘汇总数据
     */
    DashboardVO getDashboard();

    /**
     * 获取用户统计详情
     * @param query 查询条件
     */
    UserStatisticsVO getUserStatistics(StatisticsQueryDTO query);

    /**
     * 获取团队统计详情
     * @param query 查询条件
     */
    TeamStatisticsVO getTeamStatistics(StatisticsQueryDTO query);

    /**
     * 获取业务统计详情
     */
    BusinessStatisticsVO getBusinessStatistics();

    /**
     * 获取收入统计详情
     * @param query 查询条件
     */
    RevenueStatisticsVO getRevenueStatistics(StatisticsQueryDTO query);

    /**
     * 获取团队可用点数排行榜
     * @param limit 限制条数
     */
    PointsRankingVO getAvailablePointsRanking(Integer limit);

    /**
     * 获取团队点数使用排行榜
     * @param limit 限制条数
     */
    PointsRankingVO getUsagePointsRanking(Integer limit);
}
```

---

## 控制器实现

### StatisticsController (Admin)

```java
/**
 * 统计/统计报表控制器
 * <p>
 * User: peixinyi
 * Date: 2025/12/05
 */
@RestController
@RequestMapping("/api/v1/admin/statistics")
@SaCheckLogin
public class StatisticsController {

    @Resource
    private IStatisticsService statisticsService;

    /**
     * 获取仪表盘汇总数据
     */
    @GetMapping("/dashboard")
    public Result<DashboardVO> getDashboard() {
        return Result.ok(statisticsService.getDashboard());
    }

    /**
     * 获取用户统计详情
     */
    @GetMapping("/users")
    public Result<UserStatisticsVO> getUserStatistics(StatisticsQueryDTO query) {
        return Result.ok(statisticsService.getUserStatistics(query));
    }

    /**
     * 获取团队统计详情
     */
    @GetMapping("/teams")
    public Result<TeamStatisticsVO> getTeamStatistics(StatisticsQueryDTO query) {
        return Result.ok(statisticsService.getTeamStatistics(query));
    }

    /**
     * 获取业务统计详情
     */
    @GetMapping("/business")
    public Result<BusinessStatisticsVO> getBusinessStatistics() {
        return Result.ok(statisticsService.getBusinessStatistics());
    }

    /**
     * 获取收入统计详情
     */
    @GetMapping("/revenue")
    public Result<RevenueStatisticsVO> getRevenueStatistics(StatisticsQueryDTO query) {
        return Result.ok(statisticsService.getRevenueStatistics(query));
    }

    /**
     * 获取团队可用点数排行榜
     */
    @GetMapping("/points/ranking/available")
    public Result<PointsRankingVO> getAvailablePointsRanking(
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.ok(statisticsService.getAvailablePointsRanking(limit));
    }

    /**
     * 获取团队点数使用排行榜
     */
    @GetMapping("/points/ranking/usage")
    public Result<PointsRankingVO> getUsagePointsRanking(
            @RequestParam(defaultValue = "10") Integer limit) {
        return Result.ok(statisticsService.getUsagePointsRanking(limit));
    }
}
```

---

## 数据库查询设计

### 1. 用户统计查询

```sql
-- 用户总数
SELECT COUNT(*) FROM usr_user WHERE deleted = 0;

-- 今日新增用户
SELECT COUNT(*) FROM usr_user
WHERE deleted = 0 AND DATE(create_time) = CURDATE();

-- 昨日新增用户
SELECT COUNT(*) FROM usr_user
WHERE deleted = 0 AND DATE(create_time) = DATE_SUB(CURDATE(), INTERVAL 1 DAY);

-- 本月新增用户
SELECT COUNT(*) FROM usr_user
WHERE deleted = 0 AND DATE_FORMAT(create_time, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m');

-- 近30天每日新增用户
SELECT DATE(create_time) AS date, COUNT(*) AS count
FROM usr_user
WHERE deleted = 0 AND create_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(create_time)
ORDER BY date;

-- 近12月每月新增用户
SELECT DATE_FORMAT(create_time, '%Y-%m') AS month, COUNT(*) AS count
FROM usr_user
WHERE deleted = 0 AND create_time >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(create_time, '%Y-%m')
ORDER BY month;
```

### 2. 团队统计查询

```sql
-- 团队总数
SELECT COUNT(*) FROM team_team WHERE deleted = 0;

-- 按类型统计
SELECT type, COUNT(*) AS count FROM team_team
WHERE deleted = 0 GROUP BY type;

-- 今日新增团队
SELECT COUNT(*) FROM team_team
WHERE deleted = 0 AND DATE(create_time) = CURDATE();
```

### 3. 收入统计查询

```sql
-- 今日收入(已完成订单)
SELECT COALESCE(SUM(pay_amount), 0) FROM sub_order
WHERE deleted = 0 AND status IN ('PAID', 'COMPLETED')
AND DATE(pay_time) = CURDATE();

-- 按订单类型统计收入
SELECT order_type, SUM(pay_amount) AS amount
FROM sub_order
WHERE deleted = 0 AND status IN ('PAID', 'COMPLETED')
GROUP BY order_type;

-- 近30天每日收入
SELECT DATE(pay_time) AS date, SUM(pay_amount) AS amount
FROM sub_order
WHERE deleted = 0 AND status IN ('PAID', 'COMPLETED')
AND pay_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE(pay_time)
ORDER BY date;
```

### 4. 点数排行榜查询

```sql
-- 可用点数排行榜 TOP 10
SELECT
    tp.team_id,
    t.name AS team_name,
    t.logo_url AS team_logo,
    u.nickname AS owner_name,
    tp.available_points,
    tp.used_points,
    tp.total_points
FROM pts_team_point tp
JOIN team_team t ON t.id = tp.team_id AND t.deleted = 0
JOIN usr_user u ON u.id = t.owner_id AND u.deleted = 0
WHERE tp.deleted = 0
ORDER BY tp.available_points DESC
LIMIT 10;

-- 已使用点数排行榜 TOP 10
SELECT
    tp.team_id,
    t.name AS team_name,
    t.logo_url AS team_logo,
    u.nickname AS owner_name,
    tp.available_points,
    tp.used_points,
    tp.total_points
FROM pts_team_point tp
JOIN team_team t ON t.id = tp.team_id AND t.deleted = 0
JOIN usr_user u ON u.id = t.owner_id AND u.deleted = 0
WHERE tp.deleted = 0
ORDER BY tp.used_points DESC
LIMIT 10;
```

---

## 实现计划

### 阶段一: 基础结构 (优先)

1. 创建统计模块目录结构
2. 创建所有 VO 类
3. 创建 DTO 类
4. 创建枚举类
5. 创建服务接口

### 阶段二: 核心统计

1. 实现仪表盘汇总接口 (`/dashboard`)
2. 实现用户统计接口 (`/users`)
3. 实现团队统计接口 (`/teams`)

### 阶段三: 业务统计

1. 实现业务统计接口 (`/business`)
2. 实现收入统计接口 (`/revenue`)

### 阶段四: 排行榜

1. 实现可用点数排行榜 (`/points/ranking/available`)
2. 实现使用点数排行榜 (`/points/ranking/usage`)

### 阶段五: 优化

1. 添加缓存机制 (Redis)
2. 添加定时任务预计算
3. 性能优化

---

## 需求对照表

| 需求 | 对应字段 | API |
|------|----------|-----|
| 用户数量 | `DashboardVO.totalUsers` | `/dashboard` |
| 用户年月日增幅 | `TrendDataVO.*Rate` | `/users` |
| 今日用户新增 | `DashboardVO.todayNewUsers` | `/dashboard` |
| 团队数量 | `DashboardVO.totalTeams` | `/dashboard` |
| 团队年月日增幅 | `TrendDataVO.*Rate` | `/teams` |
| 今日团队新增 | `DashboardVO.todayNewTeams` | `/dashboard` |
| 计划数量 | `DashboardVO.totalPlans` | `/dashboard` |
| 功能数量 | `DashboardVO.totalFeatures` | `/dashboard` |
| 订阅数量 | `DashboardVO.totalSubscriptions` | `/dashboard` |
| 全部可用点数 | `DashboardVO.totalAvailablePoints` | `/dashboard` |
| 点数可用排行榜 | `PointsRankingVO` | `/points/ranking/available` |
| 年月日收入金额 | `RevenueStatisticsVO.*Revenue` | `/revenue` |
| 点数使用排行榜 | `PointsRankingVO` | `/points/ranking/usage` |
| 赠送数量 | `DashboardVO.totalGrants` | `/dashboard` |
| 扩容包数量 | `DashboardVO.totalResourcePacks` | `/dashboard` |

---

## Redis 缓存设计

### 缓存策略

所有统计接口均使用 Redis 缓存，有效期 **10 分钟**。

### 缓存 Key 设计

```
statistics:dashboard                           # 仪表盘汇总
statistics:users:{period}:{startDate}:{endDate}  # 用户统计
statistics:teams:{period}:{startDate}:{endDate}  # 团队统计
statistics:business                            # 业务统计
statistics:revenue:{period}:{startDate}:{endDate} # 收入统计
statistics:points:ranking:available:{limit}    # 可用点数排行榜
statistics:points:ranking:usage:{limit}        # 使用点数排行榜
```

### 缓存常量定义

```java
public class StatisticsCacheConstants {

    /** 缓存前缀 */
    public static final String CACHE_PREFIX = "statistics:";

    /** 缓存有效期: 10分钟 */
    public static final long CACHE_TTL_MINUTES = 10;
    public static final long CACHE_TTL_SECONDS = 10 * 60;

    /** 各接口缓存 Key */
    public static final String KEY_DASHBOARD = CACHE_PREFIX + "dashboard";
    public static final String KEY_USERS = CACHE_PREFIX + "users:%s:%s:%s";
    public static final String KEY_TEAMS = CACHE_PREFIX + "teams:%s:%s:%s";
    public static final String KEY_BUSINESS = CACHE_PREFIX + "business";
    public static final String KEY_REVENUE = CACHE_PREFIX + "revenue:%s:%s:%s";
    public static final String KEY_POINTS_AVAILABLE = CACHE_PREFIX + "points:ranking:available:%d";
    public static final String KEY_POINTS_USAGE = CACHE_PREFIX + "points:ranking:usage:%d";
}
```

### 服务层缓存实现

```java
@Service
public class IStatisticsServiceImpl implements IStatisticsService {

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    @Resource
    private ObjectMapper objectMapper;

    private static final long CACHE_TTL = StatisticsCacheConstants.CACHE_TTL_SECONDS;

    @Override
    public DashboardVO getDashboard() {
        String cacheKey = StatisticsCacheConstants.KEY_DASHBOARD;

        // 1. 尝试从缓存获取
        String cached = stringRedisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.hasText(cached)) {
            return parseJson(cached, DashboardVO.class);
        }

        // 2. 查询数据库
        DashboardVO result = buildDashboard();

        // 3. 写入缓存 (10分钟)
        stringRedisTemplate.opsForValue().set(
            cacheKey,
            toJson(result),
            CACHE_TTL,
            TimeUnit.SECONDS
        );

        return result;
    }

    @Override
    public UserStatisticsVO getUserStatistics(StatisticsQueryDTO query) {
        String cacheKey = String.format(
            StatisticsCacheConstants.KEY_USERS,
            query.getPeriod(),
            formatDate(query.getStartDate()),
            formatDate(query.getEndDate())
        );

        // 1. 尝试从缓存获取
        String cached = stringRedisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.hasText(cached)) {
            return parseJson(cached, UserStatisticsVO.class);
        }

        // 2. 查询数据库
        UserStatisticsVO result = buildUserStatistics(query);

        // 3. 写入缓存 (10分钟)
        stringRedisTemplate.opsForValue().set(
            cacheKey,
            toJson(result),
            CACHE_TTL,
            TimeUnit.SECONDS
        );

        return result;
    }

    @Override
    public PointsRankingVO getAvailablePointsRanking(Integer limit) {
        String cacheKey = String.format(
            StatisticsCacheConstants.KEY_POINTS_AVAILABLE,
            limit
        );

        // 1. 尝试从缓存获取
        String cached = stringRedisTemplate.opsForValue().get(cacheKey);
        if (StringUtils.hasText(cached)) {
            return parseJson(cached, PointsRankingVO.class);
        }

        // 2. 查询数据库
        PointsRankingVO result = buildAvailablePointsRanking(limit);

        // 3. 写入缓存 (10分钟)
        stringRedisTemplate.opsForValue().set(
            cacheKey,
            toJson(result),
            CACHE_TTL,
            TimeUnit.SECONDS
        );

        return result;
    }

    // ==================== 工具方法 ====================

    private <T> T parseJson(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON解析失败", e);
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON序列化失败", e);
        }
    }

    private String formatDate(Date date) {
        if (date == null) return "null";
        return new SimpleDateFormat("yyyyMMdd").format(date);
    }
}
```

### 缓存清除 (可选)

当数据发生变更时，可主动清除缓存：

```java
@Service
public class StatisticsCacheService {

    @Resource
    private StringRedisTemplate stringRedisTemplate;

    /**
     * 清除所有统计缓存
     */
    public void clearAllCache() {
        Set<String> keys = stringRedisTemplate.keys(
            StatisticsCacheConstants.CACHE_PREFIX + "*"
        );
        if (keys != null && !keys.isEmpty()) {
            stringRedisTemplate.delete(keys);
        }
    }

    /**
     * 清除仪表盘缓存
     */
    public void clearDashboardCache() {
        stringRedisTemplate.delete(StatisticsCacheConstants.KEY_DASHBOARD);
    }

    /**
     * 清除业务统计缓存
     */
    public void clearBusinessCache() {
        stringRedisTemplate.delete(StatisticsCacheConstants.KEY_BUSINESS);
    }
}
```

---

## 注意事项

1. **性能考虑**: 所有统计接口使用 Redis 缓存，有效期 10 分钟
2. **数据一致性**: 使用 `deleted = 0` 过滤已删除数据
3. **时区处理**: 日期统计需注意时区问题
4. **权限控制**: 统计接口仅对管理员开放
5. **缓存穿透**: 缓存空结果时也应设置 TTL，防止频繁查询数据库
