import { createApp } from "./app.js";

const port = 3000;
const app = createApp();

app.listen(port, () => {
  console.log(`API online na porta ${port}`);
});
