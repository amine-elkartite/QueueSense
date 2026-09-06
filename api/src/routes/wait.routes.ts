import {Router} from 'express';import {locationController} from '../controllers/location.controller.js';import {requireApiKey} from '../middleware/apiKey.js';import {asyncHandler} from '../utils/asyncHandler.js';
export const waitRouter=Router();
/** @openapi
 * /api/v1/wait-time/{locationId}:
 *   get:
 *     tags: [Wait Time]
 *     security: [{ apiKeyAuth: [] }]
 *     parameters: [{ in: path, name: locationId, required: true, schema: { type: string } }]
 *     responses: { '200': { description: Current wait and predictions }, '404': { description: Location not found }, '429': { description: Rate limit reached } }
 */
waitRouter.get('/:locationId',requireApiKey,asyncHandler(locationController.wait));
