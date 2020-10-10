var express = require("express");
var router = express.Router();

// LOGGING
var {
  api_logger,
  subscribers_events_logger,
  event_info,
} = require("../logger");
const subscribersdb = require("../db/subscribersdb");
const {
  validateSubscriber,
  invalidSubscriberErrorsJSON,
} = require("../validation/validator");

const {
  confirmEmailMessage,
  newSubscriberMessage,
  errorMessage,
} = require("../mailer/messages");

const { addMailTask } = require("../tasks");

/* send confirm enail request */
const sendValidateEmail = async (subscriber) => {
  // goes to collection => 'email_confirm'
  const validateEmailEntry = await subscribersdb.createValidateEmailEntry(
    subscriber._key
  );
  const front_url = process.env.FRONT_URL;
  const validate_url = `${front_url}/email-confirm?confirmId=${validateEmailEntry._key}`;
  // build message I'm sending
  const message = confirmEmailMessage(subscriber.email, validate_url);
  // console.log(message);
  // send to mail queue
  addMailTask({
    type: "confirm",
    key: validateEmailEntry._key,
    payload: message,
  });
  return validateEmailEntry._key;
};

const sendNewSubscriberEmail = async (subscriber) => {
  const message = newSubscriberMessage(subscriber.email);
  console.log(message);
  addMailTask({
    type: "new_subscriber",
    payload: message,
  });
  true;
};

const sendErrorMessage = async (error) => {
  const message = errorMessage(error);
  console.log(message);
  addMailTask({
    type: "error_infor",
    payload: message,
  });
  true;
};

const createSubscriber = async (subscriberData, req) => {
  // validate -------------------------------------------------------------
  const validSubscriber = await validateSubscriber(subscriberData);
  await subscribersdb.fieldToLowerExists("email", validSubscriber.email);
  const payload = {
    email: validSubscriber.email,
    "x-forwarded-for": req.headers["x-forwarded-for"],
    "x-real-ip": req.headers["x-real-ip"],
  };
  // save -----------------------------------------------------------------
  const subscriber = await subscribersdb.saveSubscriber(payload);
  await sendValidateEmail(subscriber);
  await sendNewSubscriberEmail(subscriber);
  // await sendErrorMessage(new Error('YOLO'));
  // done
  return { status: "OK", subscriber };
};

/* TODO */
/* GET subscribers stats */
router.get("/", function (req, res, next) {
  try {
    subscribers_events_logger.info(`Get subscribers stats\n${event_info(req)}`);
    res.status(200).send({ go: "gogo" });
  } catch (error) {
    api_logger.error(error.stack.toString());
    res.status(500).send({ error: "SERVER ERROR" });
  }
});

/* Create new subscriber */
router.post("/", async (req, res) => {
  try {
    const subscriberData = req.body;
    const { subscriber } = await createSubscriber(subscriberData, req);
    subscribers_events_logger.info(
      `create subscriber\n${event_info(req, subscriber)}`
    );
    return res.status(201).send({ status: "OK" });
  } catch (e) {
    // api_logger.error(error.stack.toString());
    // res.status(500).send({ error: 'SERVER ERROR' });
    if (e.name === "ValidationError") {
      api_logger.debug(e.stack.toString());
      const errors = invalidSubscriberErrorsJSON(e);
      return res
        .status(400)
        .send({ error_type: "INVALID_EMAIL_ERROR", errors: errors });
    } else if (e.name === "IntegrityError") {
      api_logger.debug(e.stack.toString());
      const error = e.error;
      return res
        .status(400)
        .send({ error_type: "INTEGRITY_ERROR", errors: error });
    } else {
      api_logger.error(e.stack.toString());
      await sendErrorMessage(e);
      return res
        .status(500)
        .send({ error_type: "SERVER_ERROR", errors: "SERVER ERROR" });
    }
  }
});

// router.get("/validate-emails", async (req, res) => {
//   try {
//     const toValidateKeys = await subscribersdb.getAllEmailConfirmsKeys();
//     console.log(toValidateKeys);
//     return res.send(toValidateKeys);
//   } catch (e) {
//     api_logger.error(e.stack.toString());
//     await sendErrorMessage(e);
//     return res
//       .status(500)
//       .send({ error_type: "SERVER_ERROR", errors: "SERVER ERROR" });
//   }
// });

/* TODO */
/* get subscriber by uuid */
// router.get("/:key", async (req, res) => {
//   //
// });

/*
 * validate email page
 */
router.post("/validate-email/:validate_key", async (req, res) => {
  try {
    // simulate net latency
    // const value = await new Promise((resolve) => setTimeout(resolve, 3000))
    const validate_key = req.params.validate_key;
    // fetch and update req from email_confirm collection
    const entry = await subscribersdb.getValidateEmailEntry(validate_key);
    if (!entry) {
      // send 404
      api_logger.error(
        `validate email page\n 404 NOT FOUND\n${event_info(
          req,
          req.user
        )}\nvalidate_key: ${validate_key}`
      );
      return res.status(404).send({ error: "NOT FOUND" });
    } else {
      const confirm_email_updated = await subscribersdb.setValidateEmailEntryDone(
        validate_key
      );
      // update subscriber set email_confirmed to true
      const subscriber_updated = await subscribersdb.updateSubscriber(
        entry.subscriber_key,
        {
          email_confirmed: true,
        }
      );
      res.send({ done: true });
    }
  } catch (e) {
    api_logger.error(e.stack.toString());
    process.env.NODE_ENV === "production" && (await sendErrorMessage(e));
    return res.status(500).send({ error: "SERVER ERROR" });
  }
});

/* TODO
 * validate resend confirm email
 */
router.post("/:key/send-confirm-email", async (req, res) => {
  // TODO
});

module.exports = router;
