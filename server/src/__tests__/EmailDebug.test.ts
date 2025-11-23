import { Student } from '../models/Student';

describe('Email Validation Debug', () => {
  test('identify which invalid emails are passing', () => {
    const invalidEmails = [
      'user@domain.c',          // TLD too short
      'user space@domain.com',   // Space in local part
      'user@domain .com',       // Space in domain  
      'user@@domain.com',       // Double @
      'user@domain..com',       // Double dot in domain
      '.user@domain.com',       // Starting with dot
      'user.@domain.com',       // Ending with dot before @
      'user@.domain.com',       // Starting domain with dot
      'user@domain.com.',       // Ending domain with dot
      'user@domain.',           // Ending with dot
    ];

    invalidEmails.forEach(email => {
      console.log(`Testing email: "${email}"`);
      try {
        new Student('Test User', '12345678901', email);
        console.log(`  PASSED (should have failed): ${email}`);
      } catch (error) {
        console.log(`  FAILED (correctly): ${email} - ${(error as Error).message}`);
      }
    });
  });
});