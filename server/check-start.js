const app = require('./src/app');
console.log('Server module loaded successfully.');
// We won't start listening as it might conflict with port 5000 if it's already there
// But importing it checks syntax and init logic.
