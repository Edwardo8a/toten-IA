const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const passArg = process.argv[2];

if (passArg) {
  const hash = bcrypt.hashSync(passArg, 10);
  console.log('\n=========================================');
  console.log('Password:', passArg);
  console.log('Bcrypt Hash:', hash);
  console.log('=========================================\n');
  console.log('Agrega esta línea a tu archivo .env:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
  process.exit(0);
}

rl.question('Introduce la contraseña de administrador para generar el hash: ', (password) => {
  if (!password) {
    console.error('La contraseña no puede estar vacía.');
    process.exit(1);
  }
  const hash = bcrypt.hashSync(password, 10);
  console.log('\n=========================================');
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('=========================================\n');
  console.log('Agrega esta línea a tu archivo .env:');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
  rl.close();
});
