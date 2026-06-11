# Nest Mall Server

基于 `NestJS`、`TypeORM` 和 `MySQL` 的商城后端服务，提供认证、权限、内容管理和文件上传等基础能力。

## 项目特性

- JWT 身份认证
- 统一接口返回结构
- RBAC 权限控制
- 角色与菜单管理
- 后台操作日志
- 轮播图管理
- 公共图片上传
- Swagger 接口文档

## 技术栈

| 技术 | 说明 |
| --- | --- |
| `NestJS` | Node.js 服务端框架 |
| `TypeORM` | ORM 数据访问 |
| `MySQL` | 关系型数据库 |
| `Swagger` | API 文档与调试 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制模板文件并按本地环境修改：

```bash
cp .env.example .env
```

示例配置：

```env
APP_PORT=3000
APP_PREFIX=api
CORS_ORIGIN=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

UPLOAD_DIR=uploads
UPLOAD_PREFIX=/uploads
```

### 3. 启动开发环境

```bash
npm run start:dev
```

### 4. 构建项目

```bash
npm run build
```

## 目录说明

| 目录 | 说明 |
| --- | --- |
| `src/` | 核心业务代码 |
| `test/` | 测试代码 |
| `sql/` | SQL 脚本 |
| `uploads/` | 本地上传文件目录 |
| `.env.example` | 环境变量模板 |

## 接口文档

本地启动后可访问：

- Swagger UI: `http://localhost:3000/api/docs`
- Swagger JSON: `http://localhost:3000/api/docs-json`

## 统一返回格式

接口统一采用以下结构：

```json
{
  "code": 0,
  "message": "请求成功",
  "data": {}
}
```

## 开发说明

- 请使用 `.env.example` 作为环境变量模板
- 不要将真实账号、密码、密钥等敏感信息提交到仓库
- 上传文件默认保存在 `uploads/` 目录

## License

MIT
