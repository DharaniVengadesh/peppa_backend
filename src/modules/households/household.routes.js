const router = require('express').Router();
const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const requireHousehold = require('../../middleware/requireHousehold');
const controller = require('./household.controller');
const {
  createHouseholdSchema,
  inviteSchema,
  joinSchema,
  cuisinesSchema,
  memberSchema,
} = require('./household.validation');

router.post('/', authenticate, validate(createHouseholdSchema), controller.create);
router.post('/join', authenticate, validate(joinSchema), controller.join);
router.post('/invites/:token/accept', authenticate, controller.acceptInvite);

router.get('/current', authenticate, requireHousehold, controller.current);
router.post('/invite', authenticate, requireHousehold, validate(inviteSchema), controller.invite);
router.put('/cuisines', authenticate, requireHousehold, validate(cuisinesSchema), controller.setCuisines);

router.get('/members', authenticate, requireHousehold, controller.listMembers);
router.post('/members', authenticate, requireHousehold, validate(memberSchema), controller.addMember);
router.patch('/members/:id', authenticate, requireHousehold, controller.updateMember);
router.delete('/members/:id', authenticate, requireHousehold, controller.deleteMember);

module.exports = router;
