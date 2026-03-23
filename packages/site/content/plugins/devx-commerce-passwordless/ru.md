---
locale: ru
---

<p align="center">
  <a href="https://www.medusajs.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/59018053/229103275-b5e482bb-4601-46e6-8142-244f531cebdb.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    <img alt="Medusa logo" src="https://user-images.githubusercontent.com/59018053/229103726-e5b529a3-9b3f-4970-8a1f-c6af37f087bf.svg">
    </picture>
  </a>
</p>
<h1 align="center">
  Medusa Plugin - Passwordless Authentication
</h1>

<h4 align="center">
  <a href="https://docs.medusajs.com">Documentation</a> |
  <a href="https://www.medusajs.com">Website</a>
</h4>

<p align="center">
  A plugin for implementing passwordless authentication in Medusa
</p>
<p align="center">
  <a href="https://github.com/medusajs/medusa/blob/master/CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat" alt="PRs welcome!" />
  </a>
    <a href="https://www.producthunt.com/posts/medusa"><img src="https://img.shields.io/badge/Product%20Hunt-%231%20Product%20of%20the%20Day-%23DA552E" alt="Product Hunt"></a>
  <a href="https://discord.gg/xpCwq3Kfn8">
    <img src="https://img.shields.io/badge/chat-on%20discord-7289DA.svg" alt="Discord Chat" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=medusajs">
    <img src="https://img.shields.io/twitter/follow/medusajs.svg?label=Follow%20@medusajs" alt="Follow @medusajs" />
  </a>
</p>

## Features

- 🔐 Phone number based authentication
- 🔢 Secure verification code generation and validation
- ⏱️ Rate limiting with maximum attempt controls
- ⏳ Code expiration management
- 🔌 Easy integration with existing Medusa stores

This plugin requires:

- [Medusa backend](https://docs.medusajs.com/development/backend/install)
- [Medusa framework](https://docs.medusajs.com/) version >= 2.7.0

## Installation

1. Install the plugin:

```bash
npm install @devx-commerce/passwordless
```

2. Add the plugin to your `medusa-config.js`:

```javascript
{
  resolve: "@medusajs/medusa/auth",
  options: {
    providers: [
      {
        resolve: `@devx-commerce/passwordless/providers/passwordless`,
        id: "passwordless",
        options: {
          jwtSecret: "secret",              // JWT secret for token generation

          limeChatOptions: {
            webhookUrl: process.env.LIMECHAT_WEBHOOK_URL,
            typeId: process.env.LIMECHAT_TYPE_ID,
          },

          // Optional configuration
          codeLength: 6,                    // Length of verification code (default: 4)
          codeExpiryMinutes: 10,            // Code expiration time in minutes (default: 15)
          maxAttempts: 5,                   // Maximum verification attempts (default: 3)
          smsRateLimitMinutes: 5,           // Time between SMS requests in minutes (default: 10)
          blockDurationMinutes: 10,         // Block duration after max attempts in minutes (default: 5)

        }
      }
    ]
  }
}
```

## Configuration Options

### Security Settings

- `codeLength`: Length of verification code (default: 4)
- `codeExpiryMinutes`: Code expiration time in minutes (default: 3)
- `maxAttempts`: Maximum verification attempts (default: 3)
- `smsRateLimitMinutes`: Time between SMS requests in minutes (default: 10)
- `blockDurationMinutes`: Block duration after max attempts in minutes (default: 5)

## How It Works

1. **Authentication Flow**:

   - User provides phone number
   - System generates a secure verification code
   - User enters the code to complete authentication

2. **Security Features**:
   - Rate limiting prevents abuse
   - Maximum attempt controls
   - Code expiration
   - Secure code generation

## Usage

The plugin provides two main endpoints:

1. **Authentication Request**

```json
POST /auth/customer/passwordless
{
  "phone": "+1234567890"
}
```

2. **Verification**

```json
POST /auth/customer/passwordless/callback
{
  "phone": "+1234567890",
  "code": "1234"
}
```

## Phone Number Format

Phone numbers must be in E.164 format:

- Starts with '+'
- Country code
- National number
- Example: +1234567890

## Error Handling

The plugin provides clear error messages for various scenarios:

- Invalid phone number format
- Rate limit exceeded
- Maximum attempts exceeded
- Invalid or expired code
- Provider-specific errors
