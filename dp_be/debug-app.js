try {
    console.log('Attempting to require app.js...');
    require('./src/app');
    console.log('Successfully required app.js');
} catch (err) {
    console.error('Failed to require app.js:', err);
}
