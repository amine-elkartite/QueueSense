import {Router} from 'express';import {authController} from '../controllers/auth.controller.js';import {asyncHandler} from '../utils/asyncHandler.js';import {validate} from '../middleware/validate.js';import {loginSchema,refreshSchema,registerSchema} from '../validators/auth.validators.js';import {requireAuth} from '../middleware/auth.js';
export const authRouter=Router();
/** @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     requestBody: { required: true, content: { application/json: { schema: { type: object, required: [email,password], properties: { email:{type:string,format:email}, password:{type:string} } } } } }
 *     responses: { '200': { description: Authenticated }, '401': { description: Invalid credentials } }
 */
authRouter.post('/register',validate(registerSchema),asyncHandler(authController.register));authRouter.post('/login',validate(loginSchema),asyncHandler(authController.login));authRouter.post('/refresh',validate(refreshSchema),asyncHandler(authController.refresh));authRouter.post('/logout',validate(refreshSchema),asyncHandler(authController.logout));authRouter.get('/me',requireAuth,asyncHandler(authController.me));
