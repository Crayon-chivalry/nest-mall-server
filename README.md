# Nest Mall Server

基于 `NestJS + TypeORM + MySQL` 的商城后端项目。

当前已接入的能力：

- JWT 认证
- 统一响应结构：`{ code, message, data }`
- RBAC 权限体系
- 菜单与角色分配
- 后台操作日志
- 轮播图管理
- 公共图片上传

## 环境变量

`.env.example`：

```env
APP_PORT=3000
APP_PREFIX=api
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=123456
DB_DATABASE=nest_mall_local
DB_SYNCHRONIZE=true
DB_LOGGING=false

JWT_SECRET=nest_mall_local_secret
JWT_EXPIRES_IN=7d

UPLOAD_DIR=uploads
UPLOAD_PREFIX=/uploads
```

## 统一返回格式

成功：

```json
{
  "code": 0,
  "message": "请求成功",
  "data": {}
}
```

失败：

```json
{
  "code": 401,
  "message": "手机号码或密码错误",
  "data": null
}
```

## Auth 认证说明

### 1. 登录接口

普通用户登录：

```http
POST /api/auth/login
Content-Type: application/json
```

后台管理员登录：

```http
POST /api/auth/admin/login
Content-Type: application/json
```

请求体一致：

```json
{
  "phone": "13800138000",
  "password": "admin123"
}
```

字段说明：

- `phone`：11 位大陆手机号
- `password`：6 到 20 位字符串

### 2. 登录成功返回

```json
{
  "code": 0,
  "message": "请求成功",
  "data": {
    "accessToken": "<jwt-token>",
    "tokenType": "Bearer",
    "user": {
      "id": 1,
      "userId": "U1713350000000123",
      "phone": "13800138000",
      "nickname": "系统管理员",
      "avatar": null,
      "role": "admin",
      "status": 1,
      "createdAt": "2026-06-10T02:00:00.000Z",
      "updatedAt": "2026-06-10T02:00:00.000Z"
    },
    "permissions": [
      "banner.view",
      "banner.create"
    ]
  }
}
```

前端通常只需要保存：

- `data.accessToken`
- `data.tokenType`

然后拼成：

```txt
Authorization: Bearer <accessToken>
```

### 3. 受保护接口怎么提交认证

所有带 JWT 鉴权的接口，都需要在请求头里传：

```http
Authorization: Bearer <accessToken>
```

注意点：

- `Bearer` 和 token 中间有一个空格
- 请求头名称必须是 `Authorization`
- 不要只传 token 本身，必须带上 `Bearer `

示例：

```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. 前端请求示例

`fetch`：

```js
const loginRes = await fetch('http://localhost:3000/api/auth/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '13800138000',
    password: 'admin123',
  }),
});

const loginJson = await loginRes.json();
const token = loginJson.data.accessToken;

const profileRes = await fetch('http://localhost:3000/api/auth/profile', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

`axios`：

```js
import axios from 'axios';

const loginRes = await axios.post('http://localhost:3000/api/auth/admin/login', {
  phone: '13800138000',
  password: 'admin123',
});

const token = loginRes.data.data.accessToken;

const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### 5. Swagger 里怎么带 token

项目已接入 Swagger：

- Swagger UI：`http://localhost:3000/api/docs`
- Swagger JSON：`http://localhost:3000/api/docs-json`

使用方式：

1. 先调用 `/api/auth/login` 或 `/api/auth/admin/login`
2. 复制返回的 `accessToken`
3. 打开 Swagger 右上角 `Authorize`
4. 输入完整值：`Bearer <accessToken>`
5. 确认后再请求需要鉴权的接口

### 6. 常见问题

`401 Unauthorized`：

- token 没传
- `Authorization` 头拼错
- 少了 `Bearer `
- token 已过期

浏览器提示跨域：

- 检查 `.env` 里的 `CORS_ORIGIN`
- 确认前端地址在允许名单内

管理员登录失败：

- 账号必须先通过 `POST /api/users/admin` 创建
- 该用户的 `role` 必须是管理员

## 用户初始化示例

### 创建管理员账号

```http
POST /api/users/admin
Content-Type: application/json
```

```json
{
  "phone": "13800138000",
  "password": "admin123",
  "nickname": "系统管理员"
}
```

### 管理员登录

```http
POST /api/auth/admin/login
Content-Type: application/json
```

```json
{
  "phone": "13800138000",
  "password": "admin123"
}
```

## 公共上传接口

### 图片上传

```http
POST /api/uploads/images
Content-Type: multipart/form-data
```

说明：

- 公共接口，不绑定具体业务模块
- 仅支持 `jpg`、`png`、`webp`、`gif`
- 单张图片最大 `5MB`
- 表单字段名为 `file`
- 上传成功后返回的 `url` 可直接用于业务字段

返回示例：

```json
{
  "code": 0,
  "message": "请求成功",
  "data": {
    "filename": "1713350000000-xxxxxx.png",
    "originalName": "banner.png",
    "mimeType": "image/png",
    "size": 123456,
    "path": "/uploads/images/1713350000000-xxxxxx.png",
    "url": "http://localhost:3000/uploads/images/1713350000000-xxxxxx.png"
  }
}
```

## 轮播图接口

### 前台接口

- `GET /api/banners/active/list`

### 后台管理接口

- `POST /api/banners`
- `GET /api/banners`
- `GET /api/banners/:id`
- `PATCH /api/banners/:id`
- `PATCH /api/banners/:id/status`
- `DELETE /api/banners/:id`

建议权限码：

- `banner.create`
- `banner.view`
- `banner.update`
- `banner.status.update`
- `banner.delete`

创建轮播图示例：

```json
{
  "title": "首页大促轮播图",
  "imageUrl": "http://localhost:3000/uploads/images/banner-1.jpg",
  "linkUrl": "https://mall.example.com/activity/spring-sale",
  "sort": 1,
  "isEnabled": true,
  "startTime": "2026-04-18 00:00:00",
  "endTime": "2026-04-30 23:59:59"
}
```

## RBAC 初始化

### 初始化轮播图权限和菜单

```http
POST /api/rbac/bootstrap/banner-management
Authorization: Bearer <token>
```

说明：

- 自动补齐轮播图相关权限
- 自动创建系统管理目录和轮播图菜单
- 支持重复调用，已存在的数据会跳过

### 给角色一键分配轮播图资源

```http
POST /api/rbac/roles/:roleId/banner-management
Authorization: Bearer <token>
```

说明：

- 自动给角色绑定轮播图相关权限
- 自动给角色绑定轮播图管理菜单
- 不会清空角色原有权限和菜单
