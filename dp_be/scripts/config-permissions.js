/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Adjust path to point to src/data/permission-schema.data.json
const permissionSchema = require('../src/data/permission-schema.data.json');

async function configPermissions() {
  try {
    console.log('Configuring permissions...');
    const recostructedRawPermissions = [];
    const reconstructedHigherarchy = {};

    const actions = ['create', 'read', 'update', 'delete'];
    const modules = Object.keys(permissionSchema);

    modules.forEach((module) => {
      const features = permissionSchema[module];
      features.forEach((permission) => {
        actions.forEach((action) => {
          recostructedRawPermissions.push(`${module.toLowerCase()}.${permission.toLowerCase()}.${action.toLowerCase()}`);
        });

        if (!reconstructedHigherarchy[module]) {
          reconstructedHigherarchy[module] = {};
        }
        reconstructedHigherarchy[module][permission] = actions;
      });
    });

    // Ensure src/config exists
    const configDir = 'src/config';
    if (!fs.existsSync(configDir)){
        fs.mkdirSync(configDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(configDir, 'permissions.json'),
      JSON.stringify({ recostructedRawPermissions, reconstructedHigherarchy }, null, 2)
    );

    console.log('Permissions configured successfully.');

    process.exit(0);
  } catch (error) {
    console.log('Error configuring permissions:', error);
    process.exit(1);
  }
}

configPermissions();
