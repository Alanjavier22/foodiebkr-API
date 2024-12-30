import express from "express";

import email from "../controllers/email.js";
import store from "../connection/dbposgres.js";
import response from "../connection/response.js";

const router = express.Router();
const _email = email(store());

router.post("/send/notification", function (req, res, next) {
  _email
    .sendNotification(req.body, "contacto")
    .then((data) => {
      response.success(req, res, data, 200);
    })
    .catch(next);
});

export default router;
