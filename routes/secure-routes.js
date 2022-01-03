import { Router } from 'express'

const protectedRouter = Router()

/*---------- Public Routes ----------*/


/*---------- Protected Routes ----------*/
// lug in the JWT strategy as a middleware so only verified users can access this route.
protectedRouter.use()

export { protectedRouter }