import express from 'express';
import { validate, schemas } from '../middleware/validation.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';
import { processChatMessage } from '../services/chat/chatService.js';

const router = express.Router();

router.post(
  '/',
  chatRateLimiter,
  validate(schemas.chatMessage),
  async (req, res) => {
    try {
      const { message, history, conversationId } = req.body;
      const result = await processChatMessage({ message, history, conversationId });

      res.json({
        reply: result.reply,
        sources: result.sources,
        conversationId: result.conversationId,
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({
        message: 'Sorry, I could not process your message right now. Please try again later.',
        error: error.message,
      });
    }
  }
);

export default router;
