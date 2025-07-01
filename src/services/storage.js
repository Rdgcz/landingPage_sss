const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const bucket = admin.storage().bucket();

module.exports = {
  uploadFile: async (fileBuffer, fileName) => {
    const file = bucket.file(fileName);
    await file.save(fileBuffer);
    return file.publicUrl();
  }
};