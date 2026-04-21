import { toTitleCase } from "@stash/utils"
import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => {
  return c.text(toTitleCase('hello hono!'))
})

export default app;
