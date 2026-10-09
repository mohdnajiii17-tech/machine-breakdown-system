import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[Server] Maintenance Coordination API active on port ${PORT}`);
  console.log(`=======================================================`);
});
