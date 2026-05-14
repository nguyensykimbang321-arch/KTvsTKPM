const bcrypt = require('bcryptjs');

const password = 'password123'; // Bạn có thể đổi mật khẩu cần hash ở đây
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Lỗi khi hash:', err);
    return;
  }
  console.log('\n================================================');
  console.log('Mật khẩu gốc:', password);
  console.log('Mã Hash chuẩn:', hash);
  console.log('================================================\n');
  console.log('Câu lệnh SQL để cập nhật:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'customer@gmail.com';`);
  console.log('================================================\n');
});
