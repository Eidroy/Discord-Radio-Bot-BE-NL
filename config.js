const fs = require('fs').promises;

async function readConfig(configPath) {
  const data = await fs.readFile(configPath);
  return JSON.parse(data);
}

async function writeConfig(configPath, config) {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

module.exports = { readConfig, writeConfig };