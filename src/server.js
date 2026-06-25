const app = require('./app');
const config = require('./config');
const { sequelize } = require('./database');
const os = require('os');

const getLanAddresses = () => {
  const nets = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  return addresses;
};

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected');

    app.listen(config.port, config.host, () => {
      console.log(`Peppa API running on port ${config.port}`);
      console.log(`Local:  ${config.appUrl}/health`);
      console.log(`Mobile: ${config.appUrl}/api/v1/mobile`);
      const lan = getLanAddresses();
      if (lan.length) {
        console.log('LAN (use this IP in Flutter / phone):');
        for (const ip of lan) {
          console.log(`  http://${ip}:${config.port}/api/v1/mobile`);
        }
      }
      console.log(`Admin UI: ${config.appUrl}/admin`);
      console.log(`Admin API: ${config.appUrl}/api/v1/admin`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();