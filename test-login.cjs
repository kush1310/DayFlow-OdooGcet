// Test database connection and user verification
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLogin() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'hrms',
            port: 3306
        });

        console.log('✅ Connected to database');

        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', ['kush@dayflow.com']);

        if (users.length === 0) {
            console.log('❌ User not found in database');
            await db.end();
            return;
        }

        console.log('✅ User found:', users[0].email, users[0].role);
        console.log('Stored password hash:', users[0].password.substring(0, 20) + '...');

        // Test password
        const testPassword = 'kush2026';
        const isValid = await bcrypt.compare(testPassword, users[0].password);

        console.log(`\nPassword test for '${testPassword}': ${isValid ? '✅ VALID' : '❌ INVALID'}`);

        if (!isValid) {
            // Try creating a new hash to compare
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log('\nNew hash generated:', newHash.substring(0, 20) + '...');

            // Update the password
            await db.query('UPDATE users SET password = ? WHERE email = ?', [newHash, 'kush@dayflow.com']);
            console.log('✅ Password updated in database');
        }

        await db.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLogin();
