---
locale: en
---

# Medusa v2 SMSAPI Plugin

A notification provider plugin that enables SMS notifications via SMSAPI.com and service for Medusa v2 projects.




## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Configuration Options](#configuration-options)
- [Development](#development)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)

## Features

- **SMS Notifications**: Send SMS via SMSAPI.io service
- **Test Mode**: Safe testing without sending actual SMS

## Prerequisites

- **Medusa v2.4.0+**
- **Node.js 20+**
- **SMSAPI.io Account** with API access token
- Active SMS credits in your SMSAPI account

## Installation

```bash
npm install @yanchesky/medusa-smsapi
# or
yarn add @yanchesky/medusa-smsapi
```

## Configuration

### 1. Environment Variables

Create or update your `.env` file:

```env
SMSAPI_ACCESS_TOKEN=your_smsapi_access_token_here
SMSAPI_FROM=YourBrand
```

### 2. Medusa Configuration

Add the plugin to your `medusa-config.ts`:

```typescript
import { SMSAPIOptions } from '@yanchesky/medusa-smsapi';
// ...
module.exports = {
  // ... other configurations
  modules: [
    // ... other modules
    {
      resolve: '@yanchesky/medusa-smsapi/providers/smsapi',
      dependencies: ['logger'] // Optional in test mode to log sent messages
      options: {
        channels: ['sms'], // Required: notification channels
        access_token: process.env.SMSAPI_ACCESS_TOKEN,
        from: process.env.SMSAPI_FROM,
      } satisfies SMSAPIOptions,
    },
  ],
}
```


## Usage

### Basic SMS Sending

```typescript
import { Modules } from '@medusajs/framework/utils';
// ...
const notificationService = container.resolve(Modules.NOTIFICATION);
await notificationService.createNotifications([{
  channel: 'sms',
  to: '48123456789', // Country prefix is required
  template: 'confrimation' // This is required by Medusa but is not used by the plugin. 
  content: {
    text: "An SMS message"
  }
}])
```

## Configuration Options

### SMSAPIOptions Interface

```typescript
interface SMSAPIOptions {
  // Required
  access_token: string     // Your SMSAPI access token
  from: string             // Sender name verified by SMSAPI
  channels: string[]       // Notification channels

  // Optional Basic Settings
  encoding?: string        // Message encoding (default: "UTF-8")
  test?: boolean           // Test mode (default: false)
  api_url?: string         // API endpoint (default: "https://smsapi.io/api")

  // Optional Advanced Settings
  flash?: boolean          // Flash SMS (default: false)
  max_parts?: 1-10         // Maximum number of parts a message can be split into
  nounicode?: boolean      // Prevents from sending messages containing special characters.
  normalize?: boolean      // Converts special characters to regular ones. ę -> e; ć -> c
  fast?: boolean           // Send SMS with the highest priority (default: false)
}
```


### Test Mode

Enable test mode to validate your setup without sending actual SMS.
In test mode a request to API endpoint will be executed validating credentials and logging sent message. 


### Local Development

```bash
# Run type checking
yarn typecheck
# Run linting
yarn lint
# Format code
yarn format
# Build plugin
yarn build
```

## Contributing

All contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Run** quality checks (`yarn typecheck && yarn lint && yarn format:check`)
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add TypeScript types for all new features
- Include comprehensive error handling
- Update documentation for new features

## Support

- 📖 **Documentation**: [Medusa Documentation](https://docs.medusajs.com)
- 📋 **SMSAPI Docs**: [SMSAPI.io Documentation](https://www.smsapi.com/docs)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yanchesky/medusa-smsapi/issues)

## License

MIT License

---

## Compatibility

- ✅ **Medusa**: v2.4.0+
- ✅ **Node.js**: 20+
- ✅ **TypeScript**: 5+
- ✅ **[OPEN API](https://www.smsapi.com/rest/)**: Latest API version
